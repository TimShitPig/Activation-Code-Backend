import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { 请求 } from '../接口服务/接口客户端';
import { 分页结果, 操作日志, 激活日志 } from '../接口服务/类型定义';
import { 按钮 } from '../通用组件/按钮';
import { 空状态 } from '../通用组件/空状态';
import { 输入框 } from '../通用组件/输入框';

export function 日志中心() {
  const [tab, setTab] = useState<'操作' | '激活'>('操作');
  const [keyword, setKeyword] = useState('');
  const [操作日志, 设置操作日志] = useState<分页结果<操作日志> | null>(null);
  const [激活日志, 设置激活日志] = useState<分页结果<激活日志> | null>(null);
  const [错误, 设置错误] = useState('');

  function 加载() {
    设置错误('');
    const params = new URLSearchParams({ page: '1', pageSize: '50' });
    if (keyword) params.set('keyword', keyword);
    if (tab === '操作') {
      请求<分页结果<操作日志>>(`/admin/logs/operations?${params}`).then(设置操作日志).catch((error) => 设置错误(error.message));
    } else {
      请求<分页结果<激活日志>>(`/admin/logs/activations?${params}`).then(设置激活日志).catch((error) => 设置错误(error.message));
    }
  }

  useEffect(() => {
    加载();
  }, [tab]);

  return (
    <section className="页面">
      <div className="页面标题">
        <div>
          <h1>日志中心</h1>
          <p>查看管理员操作、QQ 激活和机器人校验记录。</p>
        </div>
      </div>
      <div className="标签栏">
        <button className={tab === '操作' ? '当前标签' : ''} onClick={() => setTab('操作')}>管理员操作日志</button>
        <button className={tab === '激活' ? '当前标签' : ''} onClick={() => setTab('激活')}>激活与校验日志</button>
      </div>
      <div className="筛选栏">
        <输入框 标签="关键词" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="管理员 / QQ号 / 激活码 / 动作" />
        <按钮 类型="次要" 图标={<Search size={18} />} onClick={加载}>查询</按钮>
      </div>
      {错误 && <div className="错误提示">{错误}</div>}
      {tab === '操作' ? <操作日志表 数据={操作日志} /> : <激活日志表 数据={激活日志} />}
    </section>
  );
}

function 操作日志表({ 数据 }: { 数据: 分页结果<操作日志> | null }) {
  return (
    <div className="表格外框">
      <table className="数据表格">
        <thead>
          <tr>
            <th>时间</th>
            <th>管理员</th>
            <th>动作</th>
            <th>目标</th>
            <th>结果</th>
            <th>IP</th>
            <th>详情</th>
          </tr>
        </thead>
        <tbody>
          {数据?.items.map((item) => (
            <tr key={item.id}>
              <td>{格式时间(item.createdAt)}</td>
              <td>{item.adminUsername || '-'}</td>
              <td>{item.action}</td>
              <td>{item.targetType || '-'} {item.targetId || ''}</td>
              <td>{item.result === 'success' ? '成功' : '失败'}</td>
              <td>{item.ip || '-'}</td>
              <td>{item.detail || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {数据 && 数据.items.length === 0 && <空状态 文案="暂无管理员操作日志" />}
    </div>
  );
}

function 激活日志表({ 数据 }: { 数据: 分页结果<激活日志> | null }) {
  return (
    <div className="表格外框">
      <table className="数据表格">
        <thead>
          <tr>
            <th>时间</th>
            <th>动作</th>
            <th>QQ号</th>
            <th>激活码</th>
            <th>结果</th>
            <th>到期时间</th>
            <th>IP</th>
            <th>提示</th>
          </tr>
        </thead>
        <tbody>
          {数据?.items.map((item) => (
            <tr key={item.id}>
              <td>{格式时间(item.createdAt)}</td>
              <td>{item.action}</td>
              <td>{item.subjectId}</td>
              <td className="等宽">{item.code || '-'}</td>
              <td>{item.result === 'success' ? '成功' : '失败'}</td>
              <td>{格式时间(item.expiresAt)}</td>
              <td>{item.ip || '-'}</td>
              <td>{item.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {数据 && 数据.items.length === 0 && <空状态 文案="暂无激活或校验日志" />}
    </div>
  );
}

function 格式时间(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

