import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 管理员实体 } from '../数据库模型/管理员实体';
import { 操作日志模块 } from '../操作日志/操作日志模块';
import { JWT策略 } from './JWT策略';
import { 管理员认证控制器 } from './管理员认证控制器';
import { 管理员认证服务 } from './管理员认证服务';

@Module({
  imports: [
    TypeOrmModule.forFeature([管理员实体]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'please_change_this_secret',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d'
        }
      })
    }),
    forwardRef(() => 操作日志模块)
  ],
  controllers: [管理员认证控制器],
  providers: [管理员认证服务, JWT策略],
  exports: [管理员认证服务]
})
export class 管理员认证模块 {}

