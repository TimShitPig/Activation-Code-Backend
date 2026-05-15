import { 激活码状态, 状态文本 } from '../接口服务/类型定义';

export function 状态标签({ 状态 }: { 状态: 激活码状态 }) {
  return <span className={`状态标签 状态-${状态}`}>{状态文本[状态]}</span>;
}

