import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, GitCommit, KeyRound, RefreshCcw, ServerCog } from 'lucide-react';
import { 请求 } from '../接口服务/接口客户端';
import { 管理员信息, 系统更新状态 } from '../接口服务/类型定义';
import { 按钮 } from '../通用组件/按钮';
import { 输入框 } from '../通用组件/输入框';

export function 管理员设置({ 管理员 }: { 管理员: 管理员信息 }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [错误, 设置错误] = useState('');
  const [成功, 设置成功] = useState('');
  const [更新状态, 设置更新状态] = useState<系统更新状态 | null>(null);
  const [更新错误, 设置更新错误] = useState('');
  const [更新加载中, 设置更新加载中] = useState(false);
  const [命令已复制, 设置命令已复制] = useState(false);

  useEffect(() => {
    加载更新状态();
  }, []);

  async function 加载更新状态() {
    设置更新加载中(true);
    设置更新错误('');
    try {
      const data = await 请求<系统更新状态>('/admin/update/status');
      设置更新状态(data);
    } catch (error) {
      设置更新错误(error instanceof Error ? error.message : '检查更新失败');
    } finally {
      设置更新加载中(false);
    }
  }

  async function 提交(event: FormEvent) {
    event.preventDefault();
    设置错误('');
    设置成功('');
    try {
      await 请求('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      设置成功('密码修改成功，下次登录请使用新密码');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      设置错误(error instanceof Error ? error.message : '修改失败');
    }
  }

  async function 复制更新命令() {
    if (!更新状态) return;
    try {
      await navigator.clipboard.writeText(更新状态.updateCommands.join('\n'));
      设置命令已复制(true);
      window.setTimeout(() => 设置命令已复制(false), 1800);
    } catch {
      设置更新错误('复制失败，请手动选中命令后复制');
    }
  }

  return (
    <section className="页面">
      <div className="页面标题">
        <div>
          <h1>管理员设置</h1>
          <p>查看当前管理员信息、修改登录密码并检查系统更新。</p>
        </div>
      </div>
      <div className="设置网格">
        <div className="信息区块">
          <h2>账号信息</h2>
          <div className="详情列表">
            <div><span>管理员ID</span><strong>{管理员.id}</strong></div>
            <div><span>账号</span><strong>{管理员.username}</strong></div>
            <div><span>创建时间</span><strong>{new Date(管理员.createdAt).toLocaleString('zh-CN', { hour12: false })}</strong></div>
            <div><span>最后登录</span><strong>{管理员.lastLoginAt ? new Date(管理员.lastLoginAt).toLocaleString('zh-CN', { hour12: false }) : '-'}</strong></div>
          </div>
        </div>
        <form className="信息区块" onSubmit={提交}>
          <h2>修改密码</h2>
          <输入框 标签="旧密码" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <输入框 标签="新密码" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          {错误 && <div className="错误提示">{错误}</div>}
          {成功 && <div className="成功提示">{成功}</div>}
          <按钮 type="submit" 图标={<KeyRound size={18} />}>保存新密码</按钮>
        </form>
        <div className="信息区块 设置整行">
          <div className="区块标题行">
            <h2>系统更新</h2>
            <按钮 类型="次要" 图标={<RefreshCcw size={18} />} disabled={更新加载中} onClick={加载更新状态}>
              {更新加载中 ? '检查中' : '重新检查'}
            </按钮>
          </div>

          {更新错误 && <div className="错误提示">{更新错误}</div>}

          {更新状态 && (
            <div className="更新内容">
              <div className={`更新状态条 ${更新状态.checkError ? '检查失败' : 更新状态.hasUpdate ? '有更新' : '已最新'}`}>
                {更新状态.checkError ? <AlertTriangle size={20} /> : 更新状态.hasUpdate ? <GitCommit size={20} /> : <CheckCircle2 size={20} />}
                <div>
                  <strong>{更新状态.checkError ? '无法确认最新版本' : 更新状态.hasUpdate ? '发现可更新版本' : '当前已经是最新版本'}</strong>
                  <span>
                    仓库 {更新状态.repository}，分支 {更新状态.branch}，检查时间 {格式时间(更新状态.checkedAt)}
                  </span>
                </div>
              </div>

              {更新状态.checkError && <div className="错误提示">{更新状态.checkError}</div>}

              <div className="更新摘要">
                <div>
                  <span>当前版本</span>
                  <strong>{更新状态.current.version}</strong>
                </div>
                <div>
                  <span>当前提交</span>
                  <strong className="等宽">{更新状态.current.shortCommit}</strong>
                </div>
                <div>
                  <span>构建时间</span>
                  <strong>{格式时间(更新状态.current.buildTime)}</strong>
                </div>
                <div>
                  <span>最新提交</span>
                  <strong className="等宽">{更新状态.latest?.shortCommit || '-'}</strong>
                </div>
              </div>

              {更新状态.latest && (
                <div className="版本详情">
                  <div className="详情列表">
                    <div>
                      <span>提交说明</span>
                      <strong>{更新状态.latest.message || '-'}</strong>
                    </div>
                    <div>
                      <span>提交作者</span>
                      <strong>{更新状态.latest.author || '-'}</strong>
                    </div>
                    <div>
                      <span>提交时间</span>
                      <strong>{格式时间(更新状态.latest.committedAt)}</strong>
                    </div>
                    <div>
                      <span>提交链接</span>
                      <a href={更新状态.latest.url} target="_blank" rel="noreferrer">
                        打开 GitHub <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="更新命令区">
                <div className="区块标题行">
                  <h3><ServerCog size={17} />服务器更新命令</h3>
                  <按钮 类型="幽灵" 图标={<Copy size={18} />} onClick={复制更新命令}>
                    {命令已复制 ? '已复制' : '复制命令'}
                  </按钮>
                </div>
                <pre>{更新状态.updateCommands.join('\n')}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function 格式时间(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}
