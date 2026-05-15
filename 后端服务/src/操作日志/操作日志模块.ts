import { Module } from '@nestjs/common';
import { 操作日志控制器 } from './操作日志控制器';
import { 操作日志服务 } from './操作日志服务';

@Module({
  controllers: [操作日志控制器],
  providers: [操作日志服务],
  exports: [操作日志服务]
})
export class 操作日志模块 {}
