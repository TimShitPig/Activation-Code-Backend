import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { 系统配置服务 } from '../系统设置/系统配置服务';

@Injectable()
export class 机器人令牌守卫 implements CanActivate {
  constructor(private readonly 系统配置服务: 系统配置服务) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-api-token'];
    const expected = this.系统配置服务.读取机器人密钥();
    if (!expected || token !== expected) {
      throw new UnauthorizedException('机器人接口密钥不正确');
    }
    return true;
  }
}
