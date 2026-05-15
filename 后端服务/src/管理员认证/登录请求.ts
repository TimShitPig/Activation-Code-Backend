import { IsString, MinLength } from 'class-validator';

export class 登录请求 {
  @IsString({ message: '管理员账号不能为空' })
  username: string;

  @IsString({ message: '管理员密码不能为空' })
  @MinLength(6, { message: '管理员密码至少需要 6 位' })
  password: string;
}

