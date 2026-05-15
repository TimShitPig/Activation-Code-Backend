import { IsOptional, IsString, MinLength } from 'class-validator';

export class 激活请求 {
  @IsString({ message: '激活码不能为空' })
  @MinLength(4, { message: '激活码格式不正确' })
  code: string;

  @IsOptional()
  @IsString()
  subjectType?: string = 'qq';

  @IsString({ message: 'QQ号不能为空' })
  subjectId: string;
}

