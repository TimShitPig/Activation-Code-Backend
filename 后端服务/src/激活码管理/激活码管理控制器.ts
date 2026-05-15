import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JWT守卫 } from '../管理员认证/JWT守卫';
import { 当前管理员 } from '../管理员认证/当前管理员';
import { 读取客户端IP } from '../通用模块/请求信息';
import { 批量操作请求 } from './批量操作请求';
import { 生成激活码请求 } from './生成激活码请求';
import { 激活码查询请求 } from './激活码查询请求';
import { 激活码管理服务 } from './激活码管理服务';

@Controller('admin/codes')
@UseGuards(JWT守卫)
export class 激活码管理控制器 {
  constructor(private readonly 激活码管理服务: 激活码管理服务) {}

  @Post('generate')
  生成(@Body() dto: 生成激活码请求, @Req() request: Request & { user: 当前管理员 }) {
    return this.激活码管理服务.生成(dto, request.user, 读取客户端IP(request));
  }

  @Get()
  查询(@Query() query: 激活码查询请求) {
    return this.激活码管理服务.查询(query);
  }

  @Get('stats')
  统计() {
    return this.激活码管理服务.统计();
  }

  @Patch(':id/disable')
  禁用(@Param('id') id: string, @Req() request: Request & { user: 当前管理员 }) {
    return this.激活码管理服务.禁用(Number(id), request.user, 读取客户端IP(request));
  }

  @Patch(':id/enable')
  启用(@Param('id') id: string, @Req() request: Request & { user: 当前管理员 }) {
    return this.激活码管理服务.启用(Number(id), request.user, 读取客户端IP(request));
  }

  @Delete(':id')
  删除(@Param('id') id: string, @Req() request: Request & { user: 当前管理员 }) {
    return this.激活码管理服务.删除(Number(id), request.user, 读取客户端IP(request));
  }

  @Post('bulk')
  批量操作(@Body() dto: 批量操作请求, @Req() request: Request & { user: 当前管理员 }) {
    return this.激活码管理服务.批量操作(dto, request.user, 读取客户端IP(request));
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async 导出(@Query() query: 激活码查询请求, @Res() response: Response) {
    const csv = await this.激活码管理服务.导出(query);
    response.setHeader('Content-Disposition', 'attachment; filename="activation-codes.csv"');
    response.send(`\uFEFF${csv}`);
  }
}

