import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { 读取客户端IP, 读取用户代理 } from '../通用模块/请求信息';
import { 机器人令牌守卫 } from './机器人令牌守卫';
import { 激活请求 } from './激活请求';
import { 校验请求 } from './校验请求';
import { 机器人接口服务 } from './机器人接口服务';

@Controller('client')
@UseGuards(机器人令牌守卫)
export class 机器人接口控制器 {
  constructor(private readonly 机器人接口服务: 机器人接口服务) {}

  @Post('activate')
  激活(@Body() dto: 激活请求, @Req() request: Request) {
    return this.机器人接口服务.激活(dto, {
      ip: 读取客户端IP(request),
      userAgent: 读取用户代理(request)
    });
  }

  @Post('check')
  校验(@Body() dto: 校验请求, @Req() request: Request) {
    return this.机器人接口服务.校验(dto, {
      ip: 读取客户端IP(request),
      userAgent: 读取用户代理(request)
    });
  }
}

