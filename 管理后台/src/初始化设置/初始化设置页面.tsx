import { FormEvent, useState } from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { 请求 } from '../接口服务/接口客户端';
import { 按钮 } from '../通用组件/按钮';
import { 输入框 } from '../通用组件/输入框';

export function 初始化设置页面({ 初始化完成 }: { 初始化完成: () => void }) {
  const [表单, 设置表单] = useState({
    mysqlHost: '',
    mysqlPort: 3306,
    mysqlUser: '',
    mysqlPassword: '',
    mysqlDatabase: 'activation_system',
    adminUsername: 'admin',
    adminPassword: '',
    robotApiToken: '',
    corsOrigin: window.location.origin
  });
  const [错误, 设置错误] = useState('');
  const [成功, 设置成功] = useState('');
  const [提交中, 设置提交中] = useState(false);

  function 更新字段(key: keyof typeof 表单, value: string | number) {
    设置表单((old) => ({ ...old, [key]: value }));
  }

  async function 测试数据库() {
    设置错误('');
    设置成功('');
    设置提交中(true);
    try {
      await 请求('/setup/test-database', {
        method: 'POST',
        body: JSON.stringify(表单)
      });
      设置成功('数据库连接测试成功，可以保存初始化配置');
    } catch (error) {
      设置错误(error instanceof Error ? error.message : '数据库连接测试失败');
    } finally {
      设置提交中(false);
    }
  }

  async function 初始化(event: FormEvent) {
    event.preventDefault();
    设置错误('');
    设置成功('');
    设置提交中(true);
    try {
      const result = await 请求<{ robotApiToken: string }>('/setup/initialize', {
        method: 'POST',
        body: JSON.stringify(表单)
      });
      设置成功(`初始化成功。机器人密钥：${result.robotApiToken}`);
      setTimeout(初始化完成, 1200);
    } catch (error) {
      设置错误(error instanceof Error ? error.message : '初始化失败');
    } finally {
      设置提交中(false);
    }
  }

  return (
    <div className="登录页">
      <form className="初始化面板" onSubmit={初始化}>
        <div className="登录标识">
          <div className="品牌图标">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1>系统初始化设置</h1>
            <p>第一次部署后在这里填写数据库、管理员账号和机器人密钥。</p>
          </div>
        </div>

        <div className="初始化分区">
          <h2><Database size={18} /> 数据库配置</h2>
          <div className="表单网格">
            <输入框 标签="MySQL 地址" value={表单.mysqlHost} onChange={(e) => 更新字段('mysqlHost', e.target.value)} placeholder="例如 127.0.0.1 或数据库域名" />
            <输入框 标签="MySQL 端口" type="number" value={表单.mysqlPort} onChange={(e) => 更新字段('mysqlPort', Number(e.target.value))} />
            <输入框 标签="MySQL 账号" value={表单.mysqlUser} onChange={(e) => 更新字段('mysqlUser', e.target.value)} />
            <输入框 标签="MySQL 密码" type="password" value={表单.mysqlPassword} onChange={(e) => 更新字段('mysqlPassword', e.target.value)} />
            <输入框 标签="数据库名" value={表单.mysqlDatabase} onChange={(e) => 更新字段('mysqlDatabase', e.target.value)} />
            <输入框 标签="后台访问地址" value={表单.corsOrigin} onChange={(e) => 更新字段('corsOrigin', e.target.value)} />
          </div>
        </div>

        <div className="初始化分区">
          <h2>管理员与机器人</h2>
          <div className="表单网格">
            <输入框 标签="管理员账号" value={表单.adminUsername} onChange={(e) => 更新字段('adminUsername', e.target.value)} />
            <输入框 标签="管理员密码" type="password" value={表单.adminPassword} onChange={(e) => 更新字段('adminPassword', e.target.value)} />
            <输入框 标签="机器人密钥" value={表单.robotApiToken} onChange={(e) => 更新字段('robotApiToken', e.target.value)} placeholder="留空则自动生成" />
          </div>
        </div>

        {错误 && <div className="错误提示">{错误}</div>}
        {成功 && <div className="成功提示">{成功}</div>}

        <div className="弹窗操作">
          <按钮 type="button" 类型="次要" disabled={提交中} onClick={测试数据库}>
            测试数据库连接
          </按钮>
          <按钮 type="submit" disabled={提交中}>
            {提交中 ? '正在处理...' : '保存并初始化'}
          </按钮>
        </div>
      </form>
    </div>
  );
}

