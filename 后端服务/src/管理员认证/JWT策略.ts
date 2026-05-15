import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { 当前管理员 } from './当前管理员';

@Injectable()
export class JWT策略 extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'please_change_this_secret'
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

