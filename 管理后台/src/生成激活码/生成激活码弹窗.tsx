import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { 请求 } from '../接口服务/接口客户端';
import { 卡类型, 使用模式 } from '../接口服务/类型定义';
import { 按钮 } from '../通用组件/按钮';
import { 输入框 } from '../通用组件/输入框';
import { 选择框 } from '../通用组件/选择框';

interface 属性 {
  关闭: () => void;
  完成: () => void;
}

export function 生成激活码弹窗({ 关闭, 完成 }: 属性) {
  const [cardType, setCardType] = useState<卡类型>('day');
  const [useMode, setUseMode] = useState<使用模式>('single');
  const [count, setCount] = useState(10);
  const [maxUses, setMaxUses] = useState(1);
  const [batchName, setBatchName] = useState('');
  const [remark, setRemark] = useState('');
  const [错误, 设置错误] = useState('');
  const [结果, 设置结果] = useState('');
  const [提交中, 设置提交中] = useState(false);

  async function 提交(event: FormEvent) {
    event.preventDefault();
    设置错误('');
    设置结果('');
    设置提交中(true);
    try {
      const result = await 请求<{ codes: string[] }>('/admin/codes/generate', {
        method: 'POST',
        body: JSON.stringify({ cardType, useMode, count, maxUses, batchName, remark })
      });
      设置结果(`生成成功，共 ${result.codes.length} 个激活码`);
      完成();
    } catch (error) {
      设置错误(error instanceof Error ? error.message : '生成失败');
    } finally {
      设置提交中(false);
    }
  }

  return (
    <div className="弹窗遮罩">
      <form className="弹窗" onSubmit={提交}>
        <div className="弹窗标题">
          <div>
            <h2>生成激活码</h2>
            <p>按卡类型和使用模式批量生成卡密。</p>
          </div>
          <button type="button" className="关闭按钮" onClick={关闭}>
            ×
          </button>
        </div>
        <div className="表单网格">
          <选择框
            标签="卡类型"
            value={cardType}
            onChange={(e) => setCardType(e.target.value as 卡类型)}
            选项={[
              { value: 'day', label: '日卡' },
              { value: 'three_days', label: '三天卡' },
              { value: 'week', label: '周卡' },
              { value: 'month', label: '月卡' },
              { value: 'quarter', label: '季卡' },
              { value: 'half_year', label: '半年卡' },
              { value: 'year', label: '年卡' }
            ]}
          />
          <选择框
            标签="使用模式"
            value={useMode}
            onChange={(e) => setUseMode(e.target.value as 使用模式)}
            选项={[
              { value: 'single', label: '一次性卡' },
              { value: 'multi_single', label: '多人一次性卡' },
              { value: 'repeatable', label: '重复卡' }
            ]}
          />
          <输入框 标签="生成数量" type="number" min={1} max={5000} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          <输入框
            标签="最大使用次数/人数"
            type="number"
            min={1}
            value={maxUses}
            disabled={useMode === 'single'}
            onChange={(e) => setMaxUses(Number(e.target.value))}
          />
          <输入框 标签="批次名称" value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="留空则自动生成" />
          <输入框 标签="备注" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="例如：五月活动卡" />
        </div>
        {错误 && <div className="错误提示">{错误}</div>}
        {结果 && <div className="成功提示">{结果}</div>}
        <div className="弹窗操作">
          <按钮 type="button" 类型="次要" onClick={关闭}>
            关闭
          </按钮>
          <按钮 type="submit" disabled={提交中} 图标={<Plus size={18} />}>
            {提交中 ? '正在生成...' : '确认生成'}
          </按钮>
        </div>
      </form>
    </div>
  );
}

