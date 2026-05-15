import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { 操作日志模块 } from '../操作日志/操作日志模块';
import { JWT策略 } from './JWT策略';
import { 管理员认证控制器 } from './管理员认证控制器';
import { 管理员认证服务 } from './管理员认证服务';
import { 系统配置服务 } from '../系统设置/系统配置服务';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService, 系统配置服务],
      useFactory: (_config: ConfigService, 系统配置服务: 系统配置服务) => ({
        secret: 系统配置服务.读取JWT密钥(),
        signOptions: {
          expiresIn: 系统配置服务.读取JWT有效期()
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
