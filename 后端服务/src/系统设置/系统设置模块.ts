import { Global, Module } from '@nestjs/common';
import { 系统设置控制器 } from './系统设置控制器';
import { 数据库连接服务 } from './数据库连接服务';
import { 系统配置服务 } from './系统配置服务';

@Global()
@Module({
  controllers: [系统设置控制器],
  providers: [系统配置服务, 数据库连接服务],
  exports: [系统配置服务, 数据库连接服务]
})
export class 系统设置模块 {}

