import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { 初始化请求 } from './初始化请求';
import { 系统配置 } from './系统配置类型';

@Injectable()
export class 系统配置服务 {
  private 缓存配置: 系统配置 | null = null;

  constructor(private readonly env: ConfigService) {}

  配置文件路径(): string {
    return resolve(this.env.get<string>('SYSTEM_CONFIG_PATH') || 'data/系统配置.json');
  }

  是否已初始化(): boolean {
    return !!this.读取配置();
  }

  读取配置(): 系统配置 | null {
    if (this.缓存配置) return this.缓存配置;
    const file = this.配置文件路径();
    if (existsSync(file)) {
      this.缓存配置 = JSON.parse(readFileSync(file, 'utf-8')) as 系统配置;
      return this.缓存配置;
    }
    const envConfig = this.从环境变量读取配置();
    if (envConfig) {
      this.缓存配置 = envConfig;
      return this.缓存配置;
    }
    return null;
  }

  保存初始化配置(dto: 初始化请求): 系统配置 {
    const config: 系统配置 = {
      database: {
        host: dto.mysqlHost.trim(),
        port: Number(dto.mysqlPort || 3306),
        username: dto.mysqlUser.trim(),
        password: dto.mysqlPassword,
        database: dto.mysqlDatabase.trim()
      },
      admin: {
        username: dto.adminUsername.trim(),
        password: dto.adminPassword
      },
      jwtSecret: randomBytes(32).toString('hex'),
      jwtExpiresIn: '7d',
      robotApiToken: dto.robotApiToken?.trim() || randomBytes(24).toString('hex'),
      corsOrigin: dto.corsOrigin?.trim() || '*',
      initializedAt: new Date().toISOString()
    };
    const file = this.配置文件路径();
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(config, null, 2), 'utf-8');
    this.缓存配置 = config;
    return config;
  }

  读取JWT密钥(): string {
    return this.读取配置()?.jwtSecret || this.env.get<string>('JWT_SECRET') || 'please_change_this_secret';
  }

  读取JWT有效期(): string {
    return this.读取配置()?.jwtExpiresIn || this.env.get<string>('JWT_EXPIRES_IN') || '7d';
  }

  读取机器人密钥(): string {
    return this.读取配置()?.robotApiToken || this.env.get<string>('ROBOT_API_TOKEN') || '';
  }

  private 从环境变量读取配置(): 系统配置 | null {
    const host = this.env.get<string>('MYSQL_HOST');
    if (!host || host.includes('你的')) return null;
    const username = this.env.get<string>('MYSQL_USER');
    const password = this.env.get<string>('MYSQL_PASSWORD');
    const database = this.env.get<string>('MYSQL_DATABASE');
    if (!username || !password || !database) return null;

    return {
      database: {
        host,
        port: Number(this.env.get<number>('MYSQL_PORT') || 3306),
        username,
        password,
        database
      },
      admin: {
        username: this.env.get<string>('INIT_ADMIN_USERNAME') || 'admin',
        password: this.env.get<string>('INIT_ADMIN_PASSWORD') || 'admin123456'
      },
      jwtSecret: this.env.get<string>('JWT_SECRET') || randomBytes(32).toString('hex'),
      jwtExpiresIn: this.env.get<string>('JWT_EXPIRES_IN') || '7d',
      robotApiToken: this.env.get<string>('ROBOT_API_TOKEN') || randomBytes(24).toString('hex'),
      corsOrigin: this.env.get<string>('CORS_ORIGIN') || '*',
      initializedAt: new Date().toISOString()
    };
  }
}

