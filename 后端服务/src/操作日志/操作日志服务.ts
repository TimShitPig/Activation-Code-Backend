import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { 操作日志实体 } from '../数据库模型/操作日志实体';
import { 激活日志实体 } from '../数据库模型/激活日志实体';
import { 日志结果枚举 } from '../数据库模型/业务枚举';
import { 日志查询请求 } from './日志查询请求';
import { 数据库连接服务 } from '../系统设置/数据库连接服务';

interface 操作日志参数 {
  adminId?: number | null;
  adminUsername?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  result?: 日志结果枚举;
  detail?: string | null;
  ip?: string | null;
}

interface 激活日志参数 {
  action: string;
  subjectType: string;
  subjectId: string;
  code?: string | null;
  result: 日志结果枚举;
  message: string;
  expiresAt?: Date | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class 操作日志服务 {
  constructor(private readonly 数据库连接服务: 数据库连接服务) {}

  async 记录(params: 操作日志参数) {
    const 操作日志仓库 = await this.获取操作日志仓库();
    await 操作日志仓库.save(
      操作日志仓库.create({
        adminId: params.adminId ?? null,
        adminUsername: params.adminUsername ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        result: params.result ?? 日志结果枚举.成功,
        detail: params.detail ?? null,
        ip: params.ip ?? null
      })
    );
  }

  async 记录激活日志(params: 激活日志参数) {
    const 激活日志仓库 = await this.获取激活日志仓库();
    await 激活日志仓库.save(
      激活日志仓库.create({
        action: params.action,
        subjectType: params.subjectType,
        subjectId: params.subjectId,
        code: params.code ?? null,
        result: params.result,
        message: params.message,
        expiresAt: params.expiresAt ?? null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null
      })
    );
  }

  async 查询操作日志(query: 日志查询请求) {
    const page = Math.max(Number(query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
    const where = query.keyword
      ? [
          { action: Like(`%${query.keyword}%`) },
          { adminUsername: Like(`%${query.keyword}%`) },
          { detail: Like(`%${query.keyword}%`) }
        ]
      : {};

    const 操作日志仓库 = await this.获取操作日志仓库();
    const [items, total] = await 操作日志仓库.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    return { items, total, page, pageSize };
  }

  async 查询激活日志(query: 日志查询请求) {
    const page = Math.max(Number(query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
    const where = query.keyword
      ? [
          { subjectId: Like(`%${query.keyword}%`) },
          { code: Like(`%${query.keyword}%`) },
          { message: Like(`%${query.keyword}%`) }
        ]
      : {};

    const 激活日志仓库 = await this.获取激活日志仓库();
    const [items, total] = await 激活日志仓库.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    return { items, total, page, pageSize };
  }

  private 获取操作日志仓库(): Promise<Repository<操作日志实体>> {
    return this.数据库连接服务.获取仓库(操作日志实体);
  }

  private 获取激活日志仓库(): Promise<Repository<激活日志实体>> {
    return this.数据库连接服务.获取仓库(激活日志实体);
  }
}
