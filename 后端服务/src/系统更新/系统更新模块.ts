import { Module } from '@nestjs/common';
import { 系统更新控制器 } from './系统更新控制器';
import { 系统更新服务 } from './系统更新服务';

@Module({
  controllers: [系统更新控制器],
  providers: [系统更新服务]
})
export class 系统更新模块 {}
