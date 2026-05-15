import { IsOptional, IsString } from 'class-validator';

export class 校验请求 {
  @IsOptional()
  @IsString()
  subjectType?: string = 'qq';

  @IsString({ message: 'QQ号不能为空' })
  subjectId: string;
}

