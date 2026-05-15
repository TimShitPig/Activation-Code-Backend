import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { 卡类型枚举, 使用模式枚举, 激活码状态枚举 } from '../数据库模型/业务枚举';

export class 激活码查询请求 {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(卡类型枚举)
  cardType?: 卡类型枚举;

  @IsOptional()
  @IsEnum(使用模式枚举)
  useMode?: 使用模式枚举;

  @IsOptional()
  @IsEnum(激活码状态枚举)
  status?: 激活码状态枚举;

  @IsOptional()
  @IsString()
  batchName?: string;
}

