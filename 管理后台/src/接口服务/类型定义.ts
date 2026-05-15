export type 卡类型 = 'day' | 'three_days' | 'week' | 'month' | 'quarter' | 'half_year' | 'year';
export type 使用模式 = 'single' | 'multi_single' | 'repeatable';
export type 激活码状态 = 'unused' | 'activated' | 'partial' | 'disabled' | 'deleted';

export interface 管理员信息 {
  id: number;
  username: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface 激活码 {
  id: number;
  code: string;
  cardType: 卡类型;
  durationDays: number;
  useMode: 使用模式;
  status: 激活码状态;
  maxUses: number;
  usedCount: number;
  activatedAt: string | null;
  expiresAt: string | null;
  boundSubjectType: string | null;
  boundSubjectId: string | null;
  remark: string | null;
  createdAt: string;
  isExpired?: boolean;
  isActiveNow?: boolean;
  remainingSeconds?: number | null;
  realtimeStatusText?: string;
  batch?: {
    id: number;
    batchName: string;
  } | null;
}

export interface 分页结果<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  serverTime?: string;
}

export interface 激活码统计 {
  total: number;
  unused: number;
  activated: number;
  partial: number;
  disabled: number;
  expired: number;
  activeNow: number;
  todayActivated: number;
  serverTime?: string;
}

export interface 操作日志 {
  id: number;
  adminUsername: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  result: string;
  detail: string | null;
  ip: string | null;
  createdAt: string;
}

export interface 激活日志 {
  id: number;
  action: string;
  subjectType: string;
  subjectId: string;
  code: string | null;
  result: string;
  message: string;
  expiresAt: string | null;
  ip: string | null;
  createdAt: string;
}

export interface 系统更新状态 {
  repository: string;
  branch: string;
  current: {
    version: string;
    commit: string;
    shortCommit: string;
    buildTime: string | null;
    source: string;
  };
  latest: {
    commit: string;
    shortCommit: string;
    message: string;
    author: string;
    committedAt: string | null;
    url: string;
  } | null;
  hasUpdate: boolean;
  checkError: string | null;
  checkedAt: string;
  updateCommands: string[];
}

export const 卡类型文本: Record<卡类型, string> = {
  day: '日卡',
  three_days: '三天卡',
  week: '周卡',
  month: '月卡',
  quarter: '季卡',
  half_year: '半年卡',
  year: '年卡'
};

export const 使用模式文本: Record<使用模式, string> = {
  single: '一次性卡',
  multi_single: '多人一次性卡',
  repeatable: '重复卡'
};

export const 状态文本: Record<激活码状态, string> = {
  unused: '未使用',
  activated: '已激活',
  partial: '部分使用',
  disabled: '已禁用',
  deleted: '已删除'
};
