import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { 管理员实体 } from '../数据库模型/管理员实体';
import { 激活码批次实体 } from '../数据库模型/激活码批次实体';
import { 激活码实体 } from '../数据库模型/激活码实体';
import { 兑换记录实体 } from '../数据库模型/兑换记录实体';
import { 会员有效期实体 } from '../数据库模型/会员有效期实体';
import { 操作日志实体 } from '../数据库模型/操作日志实体';
import { 激活日志实体 } from '../数据库模型/激活日志实体';
import { 数据库配置 } from './系统配置类型';
import { 系统配置服务 } from './系统配置服务';

const 所有实体 = [
  管理员实体,
  激活码批次实体,
  激活码实体,
  兑换记录实体,
  会员有效期实体,
  操作日志实体,
  激活日志实体
];

@Injectable()
export class 数据库连接服务 {
  private 数据源: DataSource | null = null;

  constructor(private readonly 系统配置服务: 系统配置服务) {}

  是否已连接(): boolean {
    return !!this.数据源?.isInitialized;
  }

  async 获取数据源(): Promise<DataSource> {
    if (this.数据源?.isInitialized) return this.数据源;
    const config = this.系统配置服务.读取配置();
    if (!config) {
      throw new ServiceUnavailableException('系统尚未初始化，请先在网页设置中填写数据库和管理员信息');
    }
    return this.连接(config.database);
  }

  async 获取仓库<T extends ObjectLiteral>(entity: EntityTarget<T>): Promise<Repository<T>> {
    const source = await this.获取数据源();
    return source.getRepository(entity);
  }

  async 连接(database: 数据库配置): Promise<DataSource> {
    this.校验数据库配置(database);
    if (this.数据源?.isInitialized) return this.数据源;
    this.数据源 = new DataSource({
      type: 'mysql',
      host: database.host,
      port: database.port,
      username: database.username,
      password: database.password,
      database: database.database,
      charset: 'utf8mb4',
      entities: 所有实体,
      synchronize: true,
      logging: false
    });
    try {
      await this.数据源.initialize();
    } catch (error) {
      this.数据源 = null;
      throw this.创建连接异常(error);
    }
    return this.数据源;
  }

  async 测试连接(database: 数据库配置) {
    this.校验数据库配置(database);
    const source = new DataSource({
      type: 'mysql',
      host: database.host,
      port: database.port,
      username: database.username,
      password: database.password,
      database: database.database,
      charset: 'utf8mb4',
      entities: 所有实体,
      synchronize: false,
      logging: false
    });
    try {
      await source.initialize();
    } catch (error) {
      throw this.创建连接异常(error);
    } finally {
      if (source.isInitialized) {
        await source.destroy();
      }
    }
  }

  async 初始化管理员() {
    const config = this.系统配置服务.读取配置();
    if (!config) return;
    const repo = await this.获取仓库(管理员实体);
    const exists = await repo.findOne({ where: { username: config.admin.username } });
    if (exists) return;
    await repo.save(
      repo.create({
        username: config.admin.username,
        passwordHash: await bcrypt.hash(config.admin.password, 10),
        isEnabled: true
      })
    );
  }

  private 校验数据库配置(database: 数据库配置) {
    if (!database) {
      throw new BadRequestException('数据库配置不能为空');
    }
    const missingFields: string[] = [];
    if (!String(database.host || '').trim()) missingFields.push('MySQL地址');
    if (!database.port || Number.isNaN(Number(database.port))) missingFields.push('MySQL端口');
    if (!String(database.username || '').trim()) missingFields.push('MySQL账号');
    if (!String(database.database || '').trim()) missingFields.push('数据库名');
    if (missingFields.length > 0) {
      throw new BadRequestException(`${missingFields.join('、')}不能为空`);
    }
    database.host = String(database.host).trim();
    database.port = Number(database.port);
    database.username = String(database.username).trim();
    database.database = String(database.database).trim();
  }

  private 创建连接异常(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('数据库连接失败：', error);
    if (message.includes("reading 'databaseName'")) {
      return new InternalServerErrorException(
        '数据库表结构同步失败，请确认填写的是本系统使用的 MySQL 数据库；如果是旧库，请备份后清空旧表再重新初始化'
      );
    }
    return new InternalServerErrorException(`数据库连接失败：${message}`);
  }
}
