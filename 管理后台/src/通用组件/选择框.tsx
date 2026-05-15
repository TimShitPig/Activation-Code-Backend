import { SelectHTMLAttributes } from 'react';

interface 属性 extends SelectHTMLAttributes<HTMLSelectElement> {
  标签?: string;
  选项: Array<{ value: string; label: string }>;
}

export function 选择框({ 标签, 选项, className = '', ...props }: 属性) {
  return (
    <label className="表单项">
      {标签 && <span>{标签}</span>}
      <select className={`输入框 ${className}`} {...props}>
        {选项.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

