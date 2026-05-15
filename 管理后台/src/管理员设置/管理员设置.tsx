import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { 请求 } from '../接口服务/接口客户端';
import { 管理员信息 } from '../接口服务/类型定义';
import { 按钮 } from '../通用组件/按钮';
import { 输入框 } from '../通用组件/输入框';

export function 管理员设置({ 管理员 }: { 管理员: 管理员信息 }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [错误, 设置错误] = useState('');
  const [成功, 设置成功] = useState('');

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

  return (
    <section className="页面">
      <div className="页面标题">
        <div>
          <h1>管理员设置</h1>
          <p>查看当前管理员信息并修改登录密码。</p>
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
      </div>
    </section>
  );
}

