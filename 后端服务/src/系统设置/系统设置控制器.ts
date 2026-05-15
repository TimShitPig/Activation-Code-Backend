import { Body, Controller, Get, Post } from '@nestjs/common';
import { 初始化请求 } from './初始化请求';
import { 数据库连接服务 } from './数据库连接服务';
import { 系统配置服务 } from './系统配置服务';

@Controller('setup')
export class 系统设置控制器 {
  constructor(
    private readonly 系统配置服务: 系统配置服务,
    private readonly 数据库连接服务: 数据库连接服务
  ) {}

  @Get('status')
  状态() {
    return {
      initialized: this.系统配置服务.是否已初始化(),
      databaseConnected: this.数据库连接服务.是否已连接()
    };
  }

  @Post('test-database')
  async 测试数据库(@Body() dto: 初始化请求) {
    await this.数据库连接服务.测试连接({
      host: dto.mysqlHost,
      port: Number(dto.mysqlPort || 3306),
      username: dto.mysqlUser,
      password: dto.mysqlPassword,
      database: dto.mysqlDatabase
    });
    return {
      success: true,
      message: '数据库连接测试成功',
      data: null
    };
  }

  @Post('initialize')
  async 初始化(@Body() dto: 初始化请求) {
    const config = this.系统配置服务.保存初始化配置(dto);
    await this.数据库连接服务.连接(config.database);
    await this.数据库连接服务.初始化管理员();
    return {
      success: true,
      message: '系统初始化成功，请使用管理员账号登录',
      data: {
        robotApiToken: config.robotApiToken
      }
    };
  }
}

