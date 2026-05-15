import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class 日志查询请求 {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  keyword?: string;
}

