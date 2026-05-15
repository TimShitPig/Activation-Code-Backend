import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

interface 构建信息文件 {
  version?: string;
  commit?: string;
  buildTime?: string;
  source?: string;
}

interface GitHub提交响应 {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
    committer?: {
      name?: string;
      date?: string;
    };
  };
}

export type 更新任务阶段 = 'installing' | 'installed' | 'restarting' | 'completed' | 'failed';

export interface 更新任务状态 {
  stage: 更新任务阶段;
  message: string;
  startedAt: string;
  finishedAt: string | null;
  workdir: string;
  logFile: string;
  updateCommands: string[];
  error?: string | null;
}

@Injectable()
export class 系统更新服务 {
  private 正在自动更新 = false;

  constructor(private readonly config: ConfigService) {}

  async 查询更新状态() {
    const repository = this.config.get<string>('UPDATE_REPOSITORY') || 'TimShitPig/Activation-Code-Backend';
    const branch = this.config.get<string>('UPDATE_BRANCH') || 'main';
    const current = this.读取当前版本();
    const checkedAt = new Date().toISOString();

    try {
      const latest = await this.读取GitHub最新提交(repository, branch);
      const hasUpdate = this.判断是否有新版本(current, latest);
      return {
        repository,
        branch,
        current,
        latest,
        hasUpdate,
        checkError: null,
        checkedAt,
        updateCommands: this.更新命令(),
        updateTask: this.同步更新任务状态(hasUpdate)
      };
    } catch (error) {
      return {
        repository,
        branch,
        current,
        latest: null,
        hasUpdate: false,
        checkError: error instanceof Error ? error.message : '检查 GitHub 更新失败',
        checkedAt,
        updateCommands: this.更新命令(),
        updateTask: this.读取更新任务状态()
      };
    }
  }

  开始安装更新() {
    if (process.platform === 'win32') {
      throw new BadRequestException('一键更新仅支持 Linux Docker 服务器环境，本地 Windows 开发请复制命令手动执行');
    }
    if (this.是否有运行中任务()) {
      throw new BadRequestException('更新任务正在执行中，请稍后查看服务器日志');
    }

    const workdir = this.读取更新工作目录();
    this.确保更新工作目录(workdir);
    const logFile = this.创建更新日志路径();
    const commands = this.安装命令();
    const task = this.创建任务状态('installing', '正在安装更新，请等待构建完成', workdir, logFile, commands);
    const script = this.创建脚本(logFile, '安装更新', commands);
    this.保存更新任务状态(task);

    this.正在自动更新 = true;
    try {
      const child = spawn('/bin/sh', ['-c', script], {
        cwd: workdir,
        detached: true,
        stdio: 'ignore'
      });
      child.once('error', (error) => {
        this.正在自动更新 = false;
        this.保存失败状态(task, error instanceof Error ? error.message : String(error));
        console.error('自动更新启动失败：', error);
      });
      child.once('exit', (code) => {
        this.正在自动更新 = false;
        if (code !== 0) {
          this.保存失败状态(task, `安装命令退出，状态码：${code}`);
          console.error(`自动更新命令退出，状态码：${code}，日志：${logFile}`);
          return;
        }
        this.保存更新任务状态({
          ...task,
          stage: 'installed',
          message: '更新已安装完成，请点击立即重启完成切换',
          finishedAt: new Date().toISOString(),
          error: null
        });
      });
      child.unref();
    } catch (error) {
      this.正在自动更新 = false;
      this.保存失败状态(task, error instanceof Error ? error.message : String(error));
      throw error;
    }

    return {
      message: task.message,
      stage: task.stage,
      startedAt: task.startedAt,
      workdir,
      logFile,
      updateCommands: commands
    };
  }

  开始重启更新() {
    if (process.platform === 'win32') {
      throw new BadRequestException('立即重启仅支持 Linux Docker 服务器环境');
    }
    if (this.是否有运行中任务()) {
      throw new BadRequestException('更新任务正在执行中，请稍后查看服务器日志');
    }

    const previousTask = this.读取更新任务状态();
    if (previousTask?.stage !== 'installed') {
      throw new BadRequestException('更新尚未安装完成，无法立即重启');
    }

    const workdir = this.读取更新工作目录();
    this.确保更新工作目录(workdir);
    const logFile = this.创建更新日志路径();
    const commands = this.重启命令();
    const task = this.创建任务状态('restarting', '正在重启服务，稍后刷新页面查看结果', workdir, logFile, commands);
    this.保存更新任务状态(task);

    const script = this.创建重启脚本(logFile, commands);
    const helperCommand = this.创建重启助手命令(workdir, logFile, script);

    try {
      const child = spawn('/bin/sh', ['-c', helperCommand], {
        detached: true,
        stdio: 'ignore'
      });
      child.once('error', (error) => {
        this.保存失败状态(task, error instanceof Error ? error.message : String(error));
        console.error('重启更新启动失败：', error);
      });
      child.once('exit', (code) => {
        if (code !== 0) {
          this.保存失败状态(task, `重启助手启动失败，状态码：${code}`);
          console.error(`重启助手启动失败，状态码：${code}，日志：${logFile}`);
        }
      });
      child.unref();
    } catch (error) {
      this.保存失败状态(task, error instanceof Error ? error.message : String(error));
      throw error;
    }

    return {
      message: task.message,
      stage: task.stage,
      startedAt: task.startedAt,
      workdir,
      logFile,
      updateCommands: commands
    };
  }

  private 读取当前版本() {
    const fileInfo = this.读取构建信息文件();
    const commit = this.config.get<string>('APP_COMMIT') || fileInfo.commit || 'unknown';
    const buildTime = this.config.get<string>('APP_BUILD_TIME') || fileInfo.buildTime || null;
    const version = this.config.get<string>('APP_VERSION') || fileInfo.version || this.读取Package版本();

    return {
      version,
      commit,
      shortCommit: this.短提交(commit),
      buildTime,
      source: fileInfo.source || 'docker'
    };
  }

  private async 读取GitHub最新提交(repository: string, branch: string) {
    const url = `https://api.github.com/repos/${repository}/commits/${encodeURIComponent(branch)}`;
    const token = this.config.get<string>('GITHUB_TOKEN');
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'activation-code-backend-update-checker',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub 返回 ${response.status}，无法读取最新版本`);
    }

    const data = (await response.json()) as GitHub提交响应;
    const committedAt = data.commit.committer?.date || data.commit.author?.date || null;

    return {
      commit: data.sha,
      shortCommit: this.短提交(data.sha),
      message: data.commit.message.split('\n')[0],
      author: data.commit.author?.name || data.commit.committer?.name || '',
      committedAt,
      url: data.html_url
    };
  }

  private 判断是否有新版本(
    current: { commit: string; buildTime: string | null },
    latest: { commit: string; committedAt: string | null }
  ) {
    if (current.commit && current.commit !== 'unknown') {
      return !latest.commit.startsWith(current.commit) && !current.commit.startsWith(latest.commit);
    }

    if (!current.buildTime || !latest.committedAt) return false;
    const currentTime = new Date(current.buildTime).getTime();
    const latestTime = new Date(latest.committedAt).getTime();
    if (Number.isNaN(currentTime) || Number.isNaN(latestTime)) return false;
    return latestTime > currentTime + 60_000;
  }

  private 读取构建信息文件(): 构建信息文件 {
    const candidates = [
      resolve(process.cwd(), '版本信息.json'),
      resolve(process.cwd(), '..', '版本信息.json')
    ];

    for (const file of candidates) {
      if (!existsSync(file)) continue;
      try {
        return JSON.parse(readFileSync(file, 'utf-8')) as 构建信息文件;
      } catch {
        return {};
      }
    }
    return {};
  }

  private 读取Package版本() {
    const candidates = [
      resolve(process.cwd(), 'package.json'),
      resolve(process.cwd(), '..', 'package.json')
    ];

    for (const file of candidates) {
      if (!existsSync(file)) continue;
      try {
        const pkg = JSON.parse(readFileSync(file, 'utf-8')) as { version?: string };
        return pkg.version || 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  private 更新命令() {
    const workdir = this.读取更新工作目录();
    return [
      `cd ${this.Shell单引号(workdir)}`,
      ...this.安装命令(),
      ...this.重启命令()
    ];
  }

  private 读取更新工作目录() {
    return this.config.get<string>('UPDATE_WORKDIR') || '/root/Activation-Code-Backend';
  }

  private 创建更新日志路径() {
    const logDir = resolve(this.config.get<string>('UPDATE_LOG_DIR') || 'data/update-logs');
    mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return resolve(logDir, `auto-update-${timestamp}.log`);
  }

  private 读取更新状态文件路径() {
    return resolve(this.config.get<string>('UPDATE_TASK_FILE') || 'data/update-task.json');
  }

  private 安装命令() {
    return [
      'git pull',
      'APP_COMMIT=$(git rev-parse --short HEAD) docker compose -f docker-compose.dev.yml build --no-cache'
    ];
  }

  private 重启命令() {
    return [
      'docker compose -f docker-compose.dev.yml up -d --force-recreate'
    ];
  }

  private 创建任务状态(
    stage: 更新任务阶段,
    message: string,
    workdir: string,
    logFile: string,
    updateCommands: string[]
  ): 更新任务状态 {
    return {
      stage,
      message,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      workdir,
      logFile,
      updateCommands,
      error: null
    };
  }

  private 读取更新任务状态(): 更新任务状态 | null {
    const file = this.读取更新状态文件路径();
    if (!existsSync(file)) return null;

    try {
      const data = JSON.parse(readFileSync(file, 'utf-8')) as Partial<更新任务状态>;
      if (!this.是否更新任务阶段(data.stage)) return null;
      return {
        stage: data.stage,
        message: data.message || '',
        startedAt: data.startedAt || '',
        finishedAt: data.finishedAt || null,
        workdir: data.workdir || this.读取更新工作目录(),
        logFile: data.logFile || '',
        updateCommands: Array.isArray(data.updateCommands) ? data.updateCommands : [],
        error: data.error || null
      };
    } catch {
      return null;
    }
  }

  private 同步更新任务状态(hasUpdate: boolean) {
    const task = this.读取更新任务状态();
    if (!task) return null;

    if (this.任务运行中(task.stage) && this.任务已超时(task)) {
      const failedTask: 更新任务状态 = {
        ...task,
        stage: 'failed',
        message: '更新任务超时，请查看日志后重试',
        finishedAt: new Date().toISOString(),
        error: '更新任务超时'
      };
      this.保存更新任务状态(failedTask);
      return failedTask;
    }

    if (!hasUpdate && task.stage === 'installed') {
      const completedTask: 更新任务状态 = {
        ...task,
        stage: 'completed',
        message: '安装完成',
        finishedAt: task.finishedAt || new Date().toISOString(),
        error: null
      };
      this.保存更新任务状态(completedTask);
      return completedTask;
    }

    return task;
  }

  private 保存更新任务状态(task: 更新任务状态) {
    const file = this.读取更新状态文件路径();
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(task, null, 2), 'utf-8');
  }

  private 保存失败状态(task: 更新任务状态, error: string) {
    this.保存更新任务状态({
      ...task,
      stage: 'failed',
      message: `更新失败：${error}`,
      finishedAt: new Date().toISOString(),
      error
    });
  }

  private 是否有运行中任务() {
    if (this.正在自动更新) return true;
    const task = this.读取更新任务状态();
    if (!task || !this.任务运行中(task.stage)) return false;

    if (this.任务已超时(task)) {
      this.保存失败状态(task, '更新任务超时');
      return false;
    }

    return true;
  }

  private 任务运行中(stage: 更新任务阶段) {
    return stage === 'installing' || stage === 'restarting';
  }

  private 任务已超时(task: 更新任务状态) {
    const startedAt = new Date(task.startedAt).getTime();
    if (Number.isNaN(startedAt)) return false;
    const timeoutMinutes = Number(this.config.get<string>('UPDATE_TASK_TIMEOUT_MINUTES') || 90);
    return Date.now() - startedAt > timeoutMinutes * 60_000;
  }

  private 是否更新任务阶段(stage: unknown): stage is 更新任务阶段 {
    return stage === 'installing'
      || stage === 'installed'
      || stage === 'restarting'
      || stage === 'completed'
      || stage === 'failed';
  }

  private 确保更新工作目录(workdir: string) {
    if (!existsSync(workdir)) {
      throw new BadRequestException(`更新目录不存在：${workdir}`);
    }
  }

  private 创建脚本(logFile: string, title: string, commands: string[]) {
    return [
      'set -u',
      `mkdir -p ${this.Shell单引号(dirname(logFile))}`,
      '(',
      '  set -eu',
      `  echo ${this.Shell单引号(`==== ${title}开始 ====`)}`,
      '  date -Iseconds',
      ...commands.map((command) => `  ${command}`),
      `  echo ${this.Shell单引号(`==== ${title}完成 ====`)}`,
      '  date -Iseconds',
      `) >> ${this.Shell单引号(logFile)} 2>&1`
    ].join('\n');
  }

  private 创建重启脚本(logFile: string, commands: string[]) {
    return [
      'set -u',
      this.创建状态写入函数(),
      `mkdir -p ${this.Shell单引号(dirname(logFile))}`,
      '(',
      '  set -eu',
      '  echo "==== 重启服务开始 ===="',
      '  date -Iseconds',
      ...commands.map((command) => `  ${command}`),
      '  echo "==== 重启服务完成 ===="',
      '  date -Iseconds',
      `) >> ${this.Shell单引号(logFile)} 2>&1`,
      'status=$?',
      'if [ "$status" -eq 0 ]; then',
      '  write_state completed "安装完成"',
      'else',
      '  write_state failed "重启失败，状态码：$status" "重启失败，状态码：$status"',
      'fi',
      'exit "$status"'
    ].join('\n');
  }

  private 创建状态写入函数() {
    const stateFile = this.读取更新状态文件路径();
    return [
      'write_state() {',
      '  stage="$1"',
      '  message="$2"',
      '  error="${3:-}"',
      `  node - ${this.Shell单引号(stateFile)} "$stage" "$message" "$error" <<'NODE'`,
      "const fs = require('fs');",
      'const [file, stage, message, error] = process.argv.slice(2);',
      "const task = JSON.parse(fs.readFileSync(file, 'utf8'));",
      'task.stage = stage;',
      'task.message = message;',
      'task.finishedAt = new Date().toISOString();',
      'task.error = error || null;',
      'fs.writeFileSync(file, JSON.stringify(task, null, 2));',
      'NODE',
      '}'
    ].join('\n');
  }

  private 创建重启助手命令(workdir: string, logFile: string, script: string) {
    const helperScript = resolve(dirname(logFile), `restart-helper-${Date.now()}.sh`);
    writeFileSync(helperScript, script, 'utf-8');

    const containerName = this.config.get<string>('UPDATE_CONTAINER_NAME') || 'activation-code-app';
    const helperImage = this.config.get<string>('UPDATE_HELPER_IMAGE') || 'activation-code-backend:local';
    const helperName = `activation-code-update-${Date.now()}`;

    return [
      'docker run --rm -d',
      `--name ${this.Shell单引号(helperName)}`,
      `--volumes-from ${this.Shell单引号(containerName)}`,
      `-w ${this.Shell单引号(workdir)}`,
      '--entrypoint /bin/sh',
      this.Shell单引号(helperImage),
      this.Shell单引号(helperScript)
    ].join(' ');
  }

  private 短提交(commit: string) {
    if (!commit || commit === 'unknown') return 'unknown';
    return commit.slice(0, 7);
  }

  private Shell单引号(value: string) {
    return `'${value.replace(/'/g, `'\"'\"'`)}'`;
  }
}
