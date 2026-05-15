import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

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

@Injectable()
export class 系统更新服务 {
  constructor(private readonly config: ConfigService) {}

  async 查询更新状态() {
    const repository = this.config.get<string>('UPDATE_REPOSITORY') || 'TimShitPig/Activation-Code-Backend';
    const branch = this.config.get<string>('UPDATE_BRANCH') || 'main';
    const current = this.读取当前版本();
    const checkedAt = new Date().toISOString();

    try {
      const latest = await this.读取GitHub最新提交(repository, branch);
      return {
        repository,
        branch,
        current,
        latest,
        hasUpdate: this.判断是否有新版本(current, latest),
        checkError: null,
        checkedAt,
        updateCommands: this.更新命令()
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
        updateCommands: this.更新命令()
      };
    }
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
    const workdir = this.config.get<string>('UPDATE_WORKDIR') || '/root/Activation-Code-Backend';
    return [
      `cd ${this.Shell单引号(workdir)}`,
      'git pull',
      'APP_COMMIT=$(git rev-parse --short HEAD) docker compose -f docker-compose.dev.yml build --no-cache',
      'docker compose -f docker-compose.dev.yml up -d --force-recreate'
    ];
  }

  private 短提交(commit: string) {
    if (!commit || commit === 'unknown') return 'unknown';
    return commit.slice(0, 7);
  }

  private Shell单引号(value: string) {
    return `'${value.replace(/'/g, `'\"'\"'`)}'`;
  }
}
