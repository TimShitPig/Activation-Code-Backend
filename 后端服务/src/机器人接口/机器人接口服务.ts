import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  激活码状态枚举,
  日志结果枚举,
  使用模式枚举
} from '../数据库模型/业务枚举';
import { 激活码实体 } from '../数据库模型/激活码实体';
import { 兑换记录实体 } from '../数据库模型/兑换记录实体';
import { 会员有效期实体 } from '../数据库模型/会员有效期实体';
import { 操作日志服务 } from '../操作日志/操作日志服务';
import { 增加天数 } from '../激活码管理/激活码工具';
import { 激活请求 } from './激活请求';
import { 校验请求 } from './校验请求';

interface 请求环境 {
  ip: string;
  userAgent: string;
}

@Injectable()
export class 机器人接口服务 {
  constructor(
    @InjectRepository(激活码实体)
    private readonly 激活码仓库: Repository<激活码实体>,
    @InjectRepository(兑换记录实体)
    private readonly 兑换记录仓库: Repository<兑换记录实体>,
    @InjectRepository(会员有效期实体)
    private readonly 会员仓库: Repository<会员有效期实体>,
    private readonly dataSource: DataSource,
    private readonly 操作日志服务: 操作日志服务
  ) {}

  async 激活(dto: 激活请求, env: 请求环境) {
    const subjectType = dto.subjectType || 'qq';
    const subjectId = dto.subjectId.trim();
    const codeText = dto.code.trim().toUpperCase();

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const code = await manager.findOne(激活码实体, {
          where: { code: codeText },
          lock: { mode: 'pessimistic_write' }
        });
        if (!code || code.status === 激活码状态枚举.已删除) {
          throw new NotFoundException('激活码不存在');
        }
        if (code.status === 激活码状态枚举.已禁用) {
          throw new BadRequestException('激活码已被禁用');
        }
        if (code.useMode === 使用模式枚举.一次性 && code.usedCount >= 1) {
          throw new BadRequestException('该激活码已被使用');
        }
        if (code.useMode === 使用模式枚举.多人一次性) {
          const usedBySameSubject = await manager.findOne(兑换记录实体, {
            where: { codeId: code.id, subjectType, subjectId }
          });
          if (usedBySameSubject) {
            throw new BadRequestException('该 QQ 号已经使用过此激活码');
          }
          if (code.usedCount >= code.maxUses) {
            throw new BadRequestException('该激活码使用人数已满');
          }
        }

        let membership = await manager.findOne(会员有效期实体, {
          where: { subjectType, subjectId },
          lock: { mode: 'pessimistic_write' }
        });
        const now = new Date();
        const baseTime = membership && membership.expiresAt > now ? membership.expiresAt : now;
        const expiresAt = 增加天数(baseTime, code.durationDays);

        if (!membership) {
          membership = manager.create(会员有效期实体, {
            subjectType,
            subjectId,
            expiresAt,
            lastCodeId: code.id
          });
        } else {
          membership.expiresAt = expiresAt;
          membership.lastCodeId = code.id;
        }
        await manager.save(membership);

        code.usedCount += 1;
        code.activatedAt = code.activatedAt || now;
        code.expiresAt = expiresAt;
        code.boundSubjectType = code.boundSubjectType || subjectType;
        code.boundSubjectId = code.boundSubjectId || subjectId;
        code.status =
          code.usedCount >= code.maxUses
            ? 激活码状态枚举.已激活
            : 激活码状态枚举.部分使用;
        await manager.save(code);

        await manager.save(
          manager.create(兑换记录实体, {
            codeId: code.id,
            subjectType,
            subjectId,
            startedAt: baseTime,
            expiresAt,
            ip: env.ip
          })
        );

        return {
          subjectType,
          subjectId,
          expiresAt,
          durationDays: code.durationDays,
          code: code.code
        };
      });

      await this.操作日志服务.记录激活日志({
        action: 'QQ号激活',
        subjectType,
        subjectId,
        code: codeText,
        result: 日志结果枚举.成功,
        message: 'QQ号激活成功',
        expiresAt: result.expiresAt,
        ip: env.ip,
        userAgent: env.userAgent
      });

      return {
        active: true,
        subjectType: result.subjectType,
        subjectId: result.subjectId,
        expiresAt: result.expiresAt,
        message: '激活成功，会员时长已叠加'
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '激活失败';
      await this.操作日志服务.记录激活日志({
        action: 'QQ号激活',
        subjectType,
        subjectId,
        code: codeText,
        result: 日志结果枚举.失败,
        message,
        ip: env.ip,
        userAgent: env.userAgent
      });
      throw error;
    }
  }

  async 校验(dto: 校验请求, env: 请求环境) {
    const subjectType = dto.subjectType || 'qq';
    const subjectId = dto.subjectId.trim();
    const membership = await this.会员仓库.findOne({ where: { subjectType, subjectId } });
    const now = new Date();
    const active = !!membership && membership.expiresAt > now;
    const message = active ? '会员有效' : '会员已过期或未激活';

    await this.操作日志服务.记录激活日志({
      action: 'QQ号校验',
      subjectType,
      subjectId,
      result: active ? 日志结果枚举.成功 : 日志结果枚举.失败,
      message,
      expiresAt: membership?.expiresAt || null,
      ip: env.ip,
      userAgent: env.userAgent
    });

    return {
      active,
      subjectType,
      subjectId,
      expiresAt: membership?.expiresAt || null,
      message
    };
  }
}

