import { IsString, MinLength } from 'class-validator';

export class 修改密码请求 {
  @IsString({ message: '旧密码不能为空' })
  oldPassword: string;

  @IsString({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码至少需要 6 位' })
  newPassword: string;
}

