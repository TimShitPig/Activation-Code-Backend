export enum 卡类型枚举 {
  日卡 = 'day',
  三天卡 = 'three_days',
  周卡 = 'week',
  月卡 = 'month',
  季卡 = 'quarter',
  半年卡 = 'half_year',
  年卡 = 'year'
}

export const 卡类型天数映射: Record<卡类型枚举, number> = {
  [卡类型枚举.日卡]: 1,
  [卡类型枚举.三天卡]: 3,
  [卡类型枚举.周卡]: 7,
  [卡类型枚举.月卡]: 30,
  [卡类型枚举.季卡]: 90,
  [卡类型枚举.半年卡]: 180,
  [卡类型枚举.年卡]: 365
};

export const 卡类型中文名映射: Record<卡类型枚举, string> = {
  [卡类型枚举.日卡]: '日卡',
  [卡类型枚举.三天卡]: '三天卡',
  [卡类型枚举.周卡]: '周卡',
  [卡类型枚举.月卡]: '月卡',
  [卡类型枚举.季卡]: '季卡',
  [卡类型枚举.半年卡]: '半年卡',
  [卡类型枚举.年卡]: '年卡'
};

export enum 使用模式枚举 {
  一次性 = 'single',
  多人一次性 = 'multi_single',
  重复 = 'repeatable'
}

export const 使用模式中文名映射: Record<使用模式枚举, string> = {
  [使用模式枚举.一次性]: '一次性卡',
  [使用模式枚举.多人一次性]: '多人一次性卡',
  [使用模式枚举.重复]: '重复卡'
};

export enum 激活码状态枚举 {
  未使用 = 'unused',
  已激活 = 'activated',
  部分使用 = 'partial',
  已禁用 = 'disabled',
  已删除 = 'deleted'
}

export enum 日志结果枚举 {
  成功 = 'success',
  失败 = 'failed'
}

