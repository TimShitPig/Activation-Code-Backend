import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { 操作日志模块 } from '../操作日志/操作日志模块';
import { 机器人接口控制器 } from './机器人接口控制器';
import { 机器人接口服务 } from './机器人接口服务';
import { 机器人令牌守卫 } from './机器人令牌守卫';

@Module({
  imports: [
    ConfigModule,
    操作日志模块
  ],
  controllers: [机器人接口控制器],
  providers: [机器人接口服务, 机器人令牌守卫]
})
export class 机器人接口模块 {}
