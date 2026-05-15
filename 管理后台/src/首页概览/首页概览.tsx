import { useEffect, useState } from 'react';
import { Activity, Ban, CheckCircle2, Clock3, KeyRound, Users } from 'lucide-react';
import { 请求 } from '../接口服务/接口客户端';
import { 激活码统计 } from '../接口服务/类型定义';

export function 首页概览() {
  const [统计, 设置统计] = useState<激活码统计 | null>(null);
  const [错误, 设置错误] = useState('');

  useEffect(() => {
    请求<激活码统计>('/admin/codes/stats').then(设置统计).catch((error) => 设置错误(error.message));
  }, []);

  const cards = [
    { label: '激活码总数', value: 统计?.total ?? '-', icon: <KeyRound />, tone: '紫' },
    { label: '未使用', value: 统计?.unused ?? '-', icon: <Clock3 />, tone: '蓝' },
    { label: '已激活', value: 统计?.activated ?? '-', icon: <CheckCircle2 />, tone: '绿' },
    { label: '部分使用', value: 统计?.partial ?? '-', icon: <Users />, tone: '橙' },
    { label: '已禁用', value: 统计?.disabled ?? '-', icon: <Ban />, tone: '红' },
    { label: '今日激活', value: 统计?.todayActivated ?? '-', icon: <Activity />, tone: '青' }
  ];

  return (
    <section className="页面">
      <div className="页面标题">
        <div>
          <h1>首页概览</h1>
          <p>查看激活码库存、激活情况和今日使用情况。</p>
        </div>
      </div>
      {错误 && <div className="错误提示">{错误}</div>}
      <div className="统计网格">
        {cards.map((card) => (
          <div className={`统计卡 统计-${card.tone}`} key={card.label}>
            <div className="统计图标">{card.icon}</div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>
      <div className="信息区块">
        <h2>常用流程</h2>
        <div className="流程网格">
          <div>
            <strong>1. 生成卡密</strong>
            <span>选择卡类型、使用模式、数量和批次名。</span>
          </div>
          <div>
            <strong>2. 发给机器人</strong>
            <span>机器人调用激活接口，传入 QQ 号和激活码。</span>
          </div>
          <div>
            <strong>3. 查看日志</strong>
            <span>日志中心可以追踪每次激活、校验和管理员操作。</span>
          </div>
        </div>
      </div>
    </section>
  );
}

