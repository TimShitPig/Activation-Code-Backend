import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { 管理员认证模块 } from './管理员认证/管理员认证模块';
import { 激活码管理模块 } from './激活码管理/激活码管理模块';
import { 机器人接口模块 } from './机器人接口/机器人接口模块';
import { 操作日志模块 } from './操作日志/操作日志模块';
import { 系统设置模块 } from './系统设置/系统设置模块';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../部署配置/.env.example', '部署配置/.env.example']
    }),
    系统设置模块,
    管理员认证模块,
    激活码管理模块,
    机器人接口模块,
    操作日志模块
  ]
})
export class AppModule {}
