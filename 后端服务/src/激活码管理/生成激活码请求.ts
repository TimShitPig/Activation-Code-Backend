import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';
import { 卡类型枚举, 使用模式枚举 } from '../数据库模型/业务枚举';

export class 生成激活码请求 {
  @IsEnum(卡类型枚举, { message: '卡类型不正确' })
  cardType: 卡类型枚举;

  @IsEnum(使用模式枚举, { message: '使用模式不正确' })
  useMode: 使用模式枚举;

  @Type(() => Number)
  @IsInt({ message: '生成数量必须是整数' })
  @Min(1, { message: '生成数量至少为 1' })
  @Max(5000, { message: '单次最多生成 5000 个激活码' })
  count: number;

  @Type(() => Number)
  @IsInt({ message: '最大使用次数必须是整数' })
  @Min(1, { message: '最大使用次数至少为 1' })
  @Max(100000, { message: '最大使用次数不能超过 100000' })
  maxUses: number = 1;

  @IsOptional()
  @IsString()
  batchName?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

