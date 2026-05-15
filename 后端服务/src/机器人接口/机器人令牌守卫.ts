import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class 机器人令牌守卫 implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-api-token'];
    const expected = this.config.get<string>('ROBOT_API_TOKEN');
    if (!expected || token !== expected) {
      throw new UnauthorizedException('机器人接口密钥不正确');
    }
    return true;
  }
}

