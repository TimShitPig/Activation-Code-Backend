import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JWT守卫 } from '../管理员认证/JWT守卫';
import { 系统更新服务 } from './系统更新服务';

@Controller('admin/update')
@UseGuards(JWT守卫)
export class 系统更新控制器 {
  constructor(private readonly 系统更新服务: 系统更新服务) {}

  @Get('status')
  async 状态() {
    return this.系统更新服务.查询更新状态();
  }

  @Post('run')
  async 安装更新() {
    return this.系统更新服务.开始安装更新();
  }

  @Post('restart')
  async 重启更新() {
    return this.系统更新服务.开始重启更新();
  }
}
