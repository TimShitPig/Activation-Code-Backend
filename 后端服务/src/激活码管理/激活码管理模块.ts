import { Module } from '@nestjs/common';
import { 操作日志模块 } from '../操作日志/操作日志模块';
import { 激活码管理控制器 } from './激活码管理控制器';
import { 激活码管理服务 } from './激活码管理服务';

@Module({
  imports: [操作日志模块],
  controllers: [激活码管理控制器],
  providers: [激活码管理服务]
})
export class 激活码管理模块 {}
