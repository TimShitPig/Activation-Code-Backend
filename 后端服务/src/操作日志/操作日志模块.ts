import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 操作日志实体 } from '../数据库模型/操作日志实体';
import { 激活日志实体 } from '../数据库模型/激活日志实体';
import { 操作日志控制器 } from './操作日志控制器';
import { 操作日志服务 } from './操作日志服务';

@Module({
  imports: [TypeOrmModule.forFeature([操作日志实体, 激活日志实体])],
  controllers: [操作日志控制器],
  providers: [操作日志服务],
  exports: [操作日志服务]
})
export class 操作日志模块 {}

