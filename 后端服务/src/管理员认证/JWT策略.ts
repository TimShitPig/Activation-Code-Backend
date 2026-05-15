import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { 当前管理员 } from './当前管理员';
import { 系统配置服务 } from '../系统设置/系统配置服务';

@Injectable()
export class JWT策略 extends PassportStrategy(Strategy, 'jwt') {
  constructor(系统配置服务: 系统配置服务) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 系统配置服务.读取JWT密钥()
    });
  }

  validate(payload: { sub: number; username: string }): 当前管理员 {
    if (!payload?.sub || !payload?.username) {
      throw new UnauthorizedException('登录状态无效，请重新登录');
    }
    return {
      id: payload.sub,
      username: payload.username
    };
  }
}
