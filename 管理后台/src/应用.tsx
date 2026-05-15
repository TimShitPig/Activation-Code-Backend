import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  FileClock,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { 请求, 清除令牌, 读取令牌 } from './接口服务/接口客户端';
import { 管理员信息 } from './接口服务/类型定义';
import { 登录页面 } from './登录页面/登录页面';
import { 首页概览 } from './首页概览/首页概览';
import { 激活码列表 } from './激活码列表/激活码列表';
import { 日志中心 } from './日志中心/日志中心';
import { 管理员设置 } from './管理员设置/管理员设置';

type 页面 = '概览' | '激活码' | '日志' | '设置';

export function 应用() {
  const [管理员, 设置管理员] = useState<管理员信息 | null>(null);
  const [页面, 设置页面] = useState<页面>('概览');
  const [加载中, 设置加载中] = useState(true);

  useEffect(() => {
    if (!读取令牌()) {
      设置加载中(false);
      return;
    }
    请求<管理员信息>('/admin/profile')
      .then(设置管理员)
      .catch(() => 清除令牌())
      .finally(() => 设置加载中(false));
  }, []);

  const 导航 = useMemo(
    () => [
      { key: '概览' as 页面, label: '首页概览', icon: <LayoutDashboard size={18} /> },
      { key: '激活码' as 页面, label: '激活码列表', icon: <KeyRound size={18} /> },
      { key: '日志' as 页面, label: '日志中心', icon: <FileClock size={18} /> },
      { key: '设置' as 页面, label: '管理员设置', icon: <Settings size={18} /> }
    ],
    []
  );

  if (加载中) return <div className="全屏加载">正在加载管理后台...</div>;
  if (!管理员) return <登录页面 登录成功={设置管理员} />;

  return (
    <div className="后台布局">
      <aside className="侧边栏">
        <div className="品牌区">
          <div className="品牌图标">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>激活码后台</strong>
            <span>授权与日志管理</span>
          </div>
        </div>

        <nav className="导航列表">
          {导航.map((item) => (
            <button
              key={item.key}
              className={页面 === item.key ? '导航项 当前导航' : '导航项'}
              onClick={() => 设置页面(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="侧边栏底部">
          <div className="管理员卡片">
            <BarChart3 size={18} />
            <div>
              <span>当前管理员</span>
              <strong>{管理员.username}</strong>
            </div>
          </div>
          <button
            className="退出按钮"
            onClick={() => {
              清除令牌();
              设置管理员(null);
            }}
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      <main className="内容区">
        {页面 === '概览' && <首页概览 />}
        {页面 === '激活码' && <激活码列表 />}
        {页面 === '日志' && <日志中心 />}
        {页面 === '设置' && <管理员设置 管理员={管理员} />}
      </main>
    </div>
  );
}

