import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class 初始化请求 {
  @IsString({ message: 'MySQL地址不能为空' })
  mysqlHost: string;

  @Type(() => Number)
  @IsInt({ message: 'MySQL端口必须是整数' })
  @Min(1, { message: 'MySQL端口不正确' })
  mysqlPort: number = 3306;

  @IsString({ message: 'MySQL账号不能为空' })
  mysqlUser: string;

  @IsString({ message: 'MySQL密码不能为空' })
  mysqlPassword: string;

  @IsString({ message: '数据库名不能为空' })
  mysqlDatabase: string;

  @IsString({ message: '管理员账号不能为空' })
  adminUsername: string;

  @IsString({ message: '管理员密码不能为空' })
  @MinLength(6, { message: '管理员密码至少需要 6 位' })
  adminPassword: string;

  @IsOptional()
  @IsString()
  robotApiToken?: string;

  @IsOptional()
  @IsString()
  corsOrigin?: string;
}

