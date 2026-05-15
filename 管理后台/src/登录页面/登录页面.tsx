import { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { 保存令牌, 请求 } from '../接口服务/接口客户端';
import { 管理员信息 } from '../接口服务/类型定义';
import { 按钮 } from '../通用组件/按钮';
import { 输入框 } from '../通用组件/输入框';

export function 登录页面({ 登录成功 }: { 登录成功: (admin: 管理员信息) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [错误, 设置错误] = useState('');
  const [提交中, 设置提交中] = useState(false);

  async function 提交(event: FormEvent) {
    event.preventDefault();
    设置错误('');
    设置提交中(true);
    try {
      const result = await 请求<{ token: string; admin: 管理员信息 }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      保存令牌(result.token);
      登录成功(result.admin);
    } catch (error) {
      设置错误(error instanceof Error ? error.message : '登录失败');
    } finally {
      设置提交中(false);
    }
  }

  return (
    <div className="登录页">
      <form className="登录面板" onSubmit={提交}>
        <div className="登录标识">
          <div className="品牌图标">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1>激活码管理后台</h1>
            <p>管理员登录后可生成、禁用、导出和追踪卡密日志。</p>
          </div>
        </div>
        <输入框 标签="管理员账号" value={username} onChange={(e) => setUsername(e.target.value)} />
        <输入框
          标签="管理员密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入管理员密码"
        />
        {错误 && <div className="错误提示">{错误}</div>}
        <按钮 type="submit" disabled={提交中} 图标={<LockKeyhole size={18} />}>
          {提交中 ? '正在登录...' : '登录后台'}
        </按钮>
      </form>
    </div>
  );
}

