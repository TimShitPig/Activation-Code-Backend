import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { 管理员认证服务 } from './管理员认证服务';
import { 登录请求 } from './登录请求';
import { 修改密码请求 } from './修改密码请求';
import { JWT守卫 } from './JWT守卫';
import { 当前管理员 } from './当前管理员';
import { 操作日志服务 } from '../操作日志/操作日志服务';
import { 读取客户端IP } from '../通用模块/请求信息';

@Controller('admin')
export class 管理员认证控制器 {
  constructor(
    private readonly 管理员认证服务: 管理员认证服务,
    private readonly 操作日志服务: 操作日志服务
  ) {}

  @Post('auth/login')
  async 登录(@Body() dto: 登录请求, @Req() request: Request) {
    const result = await this.管理员认证服务.登录(dto);
    await this.操作日志服务.记录({
      adminId: result.admin.id,
      adminUsername: result.admin.username,
      action: '管理员登录',
      targetType: '管理员',
      targetId: String(result.admin.id),
      detail: '管理员登录成功',
      ip: 读取客户端IP(request)
    });
    return {
      success: true,
      message: '登录成功',
      data: result
    };
  }

  @Get('profile')
  @UseGuards(JWT守卫)
  async 当前管理员(@Req() request: Request & { user: 当前管理员 }) {
    return this.管理员认证服务.当前管理员信息(request.user);
  }

  @Post('change-password')
  @UseGuards(JWT守卫)
  async 修改密码(
    @Body() dto: 修改密码请求,
    @Req() request: Request & { user: 当前管理员 }
  ) {
    const result = await this.管理员认证服务.修改密码(request.user, dto);
    await this.操作日志服务.记录({
      adminId: request.user.id,
      adminUsername: request.user.username,
      action: '修改管理员密码',
      targetType: '管理员',
      targetId: String(request.user.id),
      detail: '管理员修改了自己的密码',
      ip: 读取客户端IP(request)
    });
    return {
      success: true,
      message: result.message,
      data: null
    };
  }
}

