import { ArrayNotEmpty, IsArray, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum 批量动作枚举 {
  禁用 = 'disable',
  启用 = 'enable',
  删除 = 'delete'
}

export class 批量操作请求 {
  @IsEnum(批量动作枚举, { message: '批量动作不正确' })
  action: 批量动作枚举;

  @IsArray({ message: '请选择激活码' })
  @ArrayNotEmpty({ message: '请选择至少一个激活码' })
  @Type(() => Number)
  @IsInt({ each: true, message: '激活码ID必须是整数' })
  ids: number[];
}

