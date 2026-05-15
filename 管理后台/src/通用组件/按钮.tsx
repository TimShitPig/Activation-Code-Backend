import { ButtonHTMLAttributes, ReactNode } from 'react';

type 按钮类型 = '主要' | '次要' | '危险' | '幽灵';

interface 属性 extends ButtonHTMLAttributes<HTMLButtonElement> {
  类型?: 按钮类型;
  图标?: ReactNode;
}

export function 按钮({ 类型 = '主要', 图标, children, className = '', ...props }: 属性) {
  return (
    <button className={`按钮 按钮-${类型} ${className}`} {...props}>
      {图标}
      <span>{children}</span>
    </button>
  );
}

