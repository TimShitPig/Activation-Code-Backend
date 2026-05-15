import { InputHTMLAttributes } from 'react';

interface 属性 extends InputHTMLAttributes<HTMLInputElement> {
  标签?: string;
}

export function 输入框({ 标签, className = '', ...props }: 属性) {
  return (
    <label className="表单项">
      {标签 && <span>{标签}</span>}
      <input className={`输入框 ${className}`} {...props} />
    </label>
  );
}

