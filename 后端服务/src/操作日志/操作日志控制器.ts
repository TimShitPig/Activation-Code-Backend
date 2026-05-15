import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JWT守卫 } from '../管理员认证/JWT守卫';
import { 日志查询请求 } from './日志查询请求';
import { 操作日志服务 } from './操作日志服务';

@Controller('admin/logs')
@UseGuards(JWT守卫)
export class 操作日志控制器 {
  constructor(private readonly 操作日志服务: 操作日志服务) {}

  @Get('operations')
  查询操作日志(@Query() query: 日志查询请求) {
    return this.操作日志服务.查询操作日志(query);
  }

  @Get('activations')
  查询激活日志(@Query() query: 日志查询请求) {
    return this.操作日志服务.查询激活日志(query);
  }
}

