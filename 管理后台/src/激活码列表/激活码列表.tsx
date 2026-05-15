import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { 下载文件, 请求 } from '../接口服务/接口客户端';
import {
  使用模式文本,
  卡类型文本,
  分页结果,
  激活码,
  激活码状态,
  状态文本
} from '../接口服务/类型定义';
import { 生成激活码弹窗 } from '../生成激活码/生成激活码弹窗';
import { 按钮 } from '../通用组件/按钮';
import { 空状态 } from '../通用组件/空状态';
import { 输入框 } from '../通用组件/输入框';
import { 选择框 } from '../通用组件/选择框';
import { 状态标签 } from '../通用组件/状态标签';

export function 激活码列表() {
  const [数据, 设置数据] = useState<分页结果<激活码> | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [选择, 设置选择] = useState<number[]>([]);
  const [弹窗, 设置弹窗] = useState(false);
  const [错误, 设置错误] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (keyword) params.set('keyword', keyword);
    if (status) params.set('status', status);
    return params.toString();
  }, [keyword, page, status]);

  function 加载() {
    设置错误('');
    请求<分页结果<激活码>>(`/admin/codes?${query}`).then(设置数据).catch((error) => 设置错误(error.message));
  }

  useEffect(() => {
    加载();
  }, [query]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      加载();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [query]);

  async function 单项操作(id: number, action: 'disable' | 'enable' | 'delete') {
    const map = {
      disable: { method: 'PATCH', url: `/admin/codes/${id}/disable` },
      enable: { method: 'PATCH', url: `/admin/codes/${id}/enable` },
      delete: { method: 'DELETE', url: `/admin/codes/${id}` }
    };
    await 请求(map[action].url, { method: map[action].method });
    加载();
  }

  async function 批量(action: 'disable' | 'enable' | 'delete') {
    if (选择.length === 0) return;
    await 请求('/admin/codes/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids: 选择 })
    });
    设置选择([]);
    加载();
  }

  function 切换选择(id: number) {
    设置选择((old) => (old.includes(id) ? old.filter((item) => item !== id) : [...old, id]));
  }

  const 当前页ID = 数据?.items.map((item) => item.id) || [];
  const 当前页已全选 = 当前页ID.length > 0 && 当前页ID.every((id) => 选择.includes(id));
  const 当前页已部分选择 = 当前页ID.some((id) => 选择.includes(id)) && !当前页已全选;

  function 切换当前页全选() {
    设置选择((old) => {
      if (当前页已全选) return old.filter((id) => !当前页ID.includes(id));
      return Array.from(new Set([...old, ...当前页ID]));
    });
  }

  return (
    <section className="页面">
      <div className="页面标题">
        <div>
          <h1>激活码列表</h1>
          <p>查询、筛选、禁用、删除和批量导出激活码。</p>
        </div>
        <div className="标题操作">
          <按钮 类型="次要" 图标={<Download size={18} />} onClick={() => 下载文件(`/admin/codes/export?${query}`, '激活码导出.csv')}>
            导出
          </按钮>
          <按钮 图标={<Plus size={18} />} onClick={() => 设置弹窗(true)}>
            生成激活码
          </按钮>
        </div>
      </div>

      <div className="筛选栏">
        <输入框 标签="搜索" placeholder="激活码 / QQ号 / 批次" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <选择框
          标签="状态"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          选项={[
            { value: '', label: '全部状态' },
            { value: 'unused', label: '未使用' },
            { value: 'activated', label: '已激活' },
            { value: 'partial', label: '部分使用' },
            { value: 'disabled', label: '已禁用' }
          ]}
        />
        <按钮 类型="次要" 图标={<Search size={18} />} onClick={加载}>
          查询
        </按钮>
        <按钮 类型="幽灵" 图标={<RefreshCcw size={18} />} onClick={加载}>
          刷新
        </按钮>
      </div>

      <div className="批量栏">
        <span>已选择 {选择.length} 个</span>
        <按钮 类型="次要" disabled={!选择.length} onClick={() => 批量('disable')}>
          批量禁用
        </按钮>
        <按钮 类型="次要" disabled={!选择.length} onClick={() => 批量('enable')}>
          批量启用
        </按钮>
        <按钮 类型="危险" disabled={!选择.length} 图标={<Trash2 size={18} />} onClick={() => 批量('delete')}>
          批量删除
        </按钮>
      </div>

      {错误 && <div className="错误提示">{错误}</div>}
      <div className="表格外框">
        <table className="数据表格">
          <thead>
            <tr>
              <th className="选择列">
                <input
                  type="checkbox"
                  aria-label="选择当前页"
                  checked={当前页已全选}
                  ref={(input) => {
                    if (input) input.indeterminate = 当前页已部分选择;
                  }}
                  onChange={切换当前页全选}
                />
              </th>
              <th>激活码</th>
              <th>卡类型</th>
              <th>模式</th>
              <th>状态</th>
              <th>使用</th>
              <th>绑定 QQ</th>
              <th>生成时间</th>
              <th>激活时间</th>
              <th>到期时间</th>
              <th>剩余时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {数据?.items.map((item) => (
              <tr key={item.id}>
                <td className="选择列">
                  <input type="checkbox" aria-label={`选择激活码 ${item.code}`} checked={选择.includes(item.id)} onChange={() => 切换选择(item.id)} />
                </td>
                <td className="等宽">{item.code}</td>
                <td>{卡类型文本[item.cardType]}</td>
                <td>{使用模式文本[item.useMode]}</td>
                <td>
                  <div className="状态组合">
                    <状态标签 状态={item.status as 激活码状态} />
                    {item.isExpired && <span className="到期标签">已到期</span>}
                    {item.isActiveNow && <span className="有效标签">有效中</span>}
                  </div>
                </td>
                <td>{item.usedCount}/{item.maxUses}</td>
                <td>{item.boundSubjectId || '-'}</td>
                <td>{格式时间(item.createdAt)}</td>
                <td>{格式时间(item.activatedAt)}</td>
                <td>{格式时间(item.expiresAt)}</td>
                <td>{格式剩余时间(item.remainingSeconds)}</td>
                <td className="行操作">
                  {item.status === 'disabled' ? (
                    <button onClick={() => 单项操作(item.id, 'enable')}>启用</button>
                  ) : (
                    <button onClick={() => 单项操作(item.id, 'disable')}>禁用</button>
                  )}
                  <button className="危险文字" onClick={() => 单项操作(item.id, 'delete')}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {数据 && 数据.items.length === 0 && <空状态 文案="没有找到符合条件的激活码" />}
      </div>

      <div className="分页栏">
        <span>共 {数据?.total || 0} 条</span>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
        <span>第 {page} 页</span>
        <button disabled={!数据 || page * 数据.pageSize >= 数据.total} onClick={() => setPage(page + 1)}>下一页</button>
      </div>

      {弹窗 && <生成激活码弹窗 关闭={() => 设置弹窗(false)} 完成={加载} />}
    </section>
  );
}

function 格式时间(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function 格式剩余时间(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return '-';
  if (seconds <= 0) return '已到期';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天 ${hours}小时`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${minutes}分钟`;
}
