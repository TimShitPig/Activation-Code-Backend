import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, Not } from 'typeorm';
import {
  卡类型中文名映射,
  卡类型天数映射,
  激活码状态枚举,
  使用模式中文名映射,
  使用模式枚举
} from '../数据库模型/业务枚举';
import { 激活码批次实体 } from '../数据库模型/激活码批次实体';
import { 激活码实体 } from '../数据库模型/激活码实体';
import { 当前管理员 } from '../管理员认证/当前管理员';
import { 操作日志服务 } from '../操作日志/操作日志服务';
import { 数据库连接服务 } from '../系统设置/数据库连接服务';
import { 生成激活码请求 } from './生成激活码请求';
import { 激活码查询请求 } from './激活码查询请求';
import { 批量动作枚举, 批量操作请求 } from './批量操作请求';
import { 生成随机激活码, 转CSV值 } from './激活码工具';

@Injectable()
export class 激活码管理服务 {
  constructor(
    private readonly 数据库连接服务: 数据库连接服务,
    private readonly 操作日志服务: 操作日志服务
  ) {}

  async 生成(dto: 生成激活码请求, admin: 当前管理员, ip: string) {
    const durationDays = 卡类型天数映射[dto.cardType];
    if (!durationDays) throw new BadRequestException('卡类型不正确');

    const maxUses = this.规范化最大使用次数(dto.useMode, dto.maxUses);
    const batchName =
      dto.batchName?.trim() ||
      `${卡类型中文名映射[dto.cardType]}-${使用模式中文名映射[dto.useMode]}-${new Date().toISOString().slice(0, 19)}`;

    const dataSource = await this.数据库连接服务.获取数据源();
    const result = await dataSource.transaction(async (manager) => {
      const batch = await manager.save(
        manager.create(激活码批次实体, {
          batchName,
          cardType: dto.cardType,
          useMode: dto.useMode,
          totalCount: dto.count,
          maxUses,
          createdBy: admin.id,
          remark: dto.remark || null
        })
      );

      const codes: 激活码实体[] = [];
      const codeSet = new Set<string>();
      while (codes.length < dto.count) {
        const code = 生成随机激活码();
        if (codeSet.has(code)) continue;
        codeSet.add(code);
        codes.push(
          manager.create(激活码实体, {
            code,
            cardType: dto.cardType,
            durationDays,
            useMode: dto.useMode,
            status: 激活码状态枚举.未使用,
            maxUses,
            usedCount: 0,
            batchId: batch.id,
            remark: dto.remark || null
          })
        );
      }

      await manager.save(codes);
      return { batch, codes };
    });

    await this.操作日志服务.记录({
      adminId: admin.id,
      adminUsername: admin.username,
      action: '生成激活码',
      targetType: '激活码批次',
      targetId: String(result.batch.id),
      detail: `生成 ${dto.count} 个${卡类型中文名映射[dto.cardType]}，模式：${使用模式中文名映射[dto.useMode]}`,
      ip
    });

    return {
      batch: result.batch,
      codes: result.codes.map((item) => item.code)
    };
  }

  async 查询(query: 激活码查询请求) {
    const page = Math.max(Number(query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
    const 激活码仓库 = await this.数据库连接服务.获取仓库(激活码实体);
    const builder = 激活码仓库
      .createQueryBuilder('code')
      .leftJoinAndSelect('code.batch', 'batch')
      .where('code.status != :deleted', { deleted: 激活码状态枚举.已删除 });

    if (query.keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('code.code LIKE :keyword')
            .orWhere('code.bound_subject_id LIKE :keyword')
            .orWhere('batch.batch_name LIKE :keyword');
        }),
        { keyword: `%${query.keyword}%` }
      );
    }
    if (query.cardType) builder.andWhere('code.card_type = :cardType', { cardType: query.cardType });
    if (query.useMode) builder.andWhere('code.use_mode = :useMode', { useMode: query.useMode });
    if (query.status) builder.andWhere('code.status = :status', { status: query.status });
    if (query.batchName) builder.andWhere('batch.batch_name LIKE :batchName', { batchName: `%${query.batchName}%` });

    const [items, total] = await builder
      .orderBy('code.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: items.map((item) => this.附加实时状态(item)),
      total,
      page,
      pageSize,
      serverTime: new Date()
    };
  }

  async 统计() {
    const 激活码仓库 = await this.数据库连接服务.获取仓库(激活码实体);
    const now = new Date();
    const [total, unused, activated, partial, disabled, expired, activeNow] = await Promise.all([
      激活码仓库.count({ where: { status: Not(激活码状态枚举.已删除) } }),
      激活码仓库.count({ where: { status: 激活码状态枚举.未使用 } }),
      激活码仓库.count({ where: { status: 激活码状态枚举.已激活 } }),
      激活码仓库.count({ where: { status: 激活码状态枚举.部分使用 } }),
      激活码仓库.count({ where: { status: 激活码状态枚举.已禁用 } }),
      激活码仓库
        .createQueryBuilder('code')
        .where('code.status != :deleted', { deleted: 激活码状态枚举.已删除 })
        .andWhere('code.expires_at IS NOT NULL')
        .andWhere('code.expires_at <= :now', { now })
        .getCount(),
      激活码仓库
        .createQueryBuilder('code')
        .where('code.status != :deleted', { deleted: 激活码状态枚举.已删除 })
        .andWhere('code.expires_at IS NOT NULL')
        .andWhere('code.expires_at > :now', { now })
        .getCount()
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivated = await 激活码仓库
      .createQueryBuilder('code')
      .where('code.activated_at >= :today', { today })
      .getCount();

    return { total, unused, activated, partial, disabled, expired, activeNow, todayActivated, serverTime: now };
  }

  async 禁用(id: number, admin: 当前管理员, ip: string) {
    const code = await this.查找可操作激活码(id);
    code.status = 激活码状态枚举.已禁用;
    const 激活码仓库 = await this.数据库连接服务.获取仓库(激活码实体);
    await 激活码仓库.save(code);
    await this.操作日志服务.记录({
      adminId: admin.id,
      adminUsername: admin.username,
      action: '禁用激活码',
      targetType: '激活码',
      targetId: String(code.id),
      detail: `禁用激活码 ${code.code}`,
      ip
    });
    return { message: '激活码已禁用' };
  }

  async 启用(id: number, admin: 当前管理员, ip: string) {
    const 激活码仓库 = await this.数据库连接服务.获取仓库(激活码实体);
    const code = await 激活码仓库.findOne({ where: { id } });
    if (!code || code.status === 激活码状态枚举.已删除) {
      throw new NotFoundException('激活码不存在');
    }
    code.status =
      code.usedCount === 0
        ? 激活码状态枚举.未使用
        : code.usedCount >= code.maxUses
          ? 激活码状态枚举.已激活
          : 激活码状态枚举.部分使用;
    await 激活码仓库.save(code);
    await this.操作日志服务.记录({
      adminId: admin.id,
      adminUsername: admin.username,
      action: '启用激活码',
      targetType: '激活码',
      targetId: String(code.id),
      detail: `启用激活码 ${code.code}`,
      ip
    });
    return { message: '激活码已启用' };
  }

  async 删除(id: number, admin: 当前管理员, ip: string) {
    const code = await this.查找可操作激活码(id);
    code.status = 激活码状态枚举.已删除;
    const 激活码仓库 = await this.数据库连接服务.获取仓库(激活码实体);
    await 激活码仓库.save(code);
    await this.操作日志服务.记录({
      adminId: admin.id,
      adminUsername: admin.username,
      action: '删除激活码',
      targetType: '激活码',
      targetId: String(code.id),
      detail: `删除激活码 ${code.code}`,
      ip
    });
    return { message: '激活码已删除' };
  }

  async 批量操作(dto: 批量操作请求, admin: 当前管理员, ip: string) {
    let count = 0;
    for (const id of dto.ids) {
      if (dto.action === 批量动作枚举.禁用) {
        await this.禁用(id, admin, ip);
        count += 1;
      } else if (dto.action === 批量动作枚举.启用) {
        await this.启用(id, admin, ip);
        count += 1;
      } else {
        await this.删除(id, admin, ip);
        count += 1;
      }
    }
    return { message: `批量操作完成，共处理 ${count} 个激活码`, count };
  }

  async 导出(query: 激活码查询请求): Promise<string> {
    const result = await this.查询({ ...query, page: 1, pageSize: 10000 });
    const rows = [
      ['激活码', '卡类型', '有效天数', '使用模式', '状态', '已使用次数', '最大使用次数', '绑定类型', '绑定ID', '生成时间', '激活时间', '到期时间', '批次']
    ];
    for (const item of result.items) {
      rows.push([
        item.code,
        卡类型中文名映射[item.cardType],
        String(item.durationDays),
        使用模式中文名映射[item.useMode],
        item.status,
        String(item.usedCount),
        String(item.maxUses),
        item.boundSubjectType || '',
        item.boundSubjectId || '',
        item.createdAt?.toISOString() || '',
        item.activatedAt?.toISOString() || '',
        item.expiresAt?.toISOString() || '',
        item.batch?.batchName || ''
      ]);
    }
    return rows.map((row) => row.map(转CSV值).join(',')).join('\n');
  }

  private 规范化最大使用次数(useMode: 使用模式枚举, maxUses?: number): number {
    if (useMode === 使用模式枚举.一次性) return 1;
    if (useMode === 使用模式枚举.多人一次性) return Math.max(Number(maxUses || 1), 1);
    return Math.max(Number(maxUses || 999999), 1);
  }

  private async 查找可操作激活码(id: number) {
    const 激活码仓库 = await this.数据库连接服务.获取仓库(激活码实体);
    const code = await 激活码仓库.findOne({ where: { id } });
    if (!code || code.status === 激活码状态枚举.已删除) {
      throw new NotFoundException('激活码不存在');
    }
    return code;
  }

  private 附加实时状态(item: 激活码实体) {
    const now = Date.now();
    const expiresAtTime = item.expiresAt ? item.expiresAt.getTime() : null;
    const remainingSeconds = expiresAtTime ? Math.max(Math.floor((expiresAtTime - now) / 1000), 0) : null;
    const isExpired = item.status !== 激活码状态枚举.已删除 && !!expiresAtTime && expiresAtTime <= now;
    const isActiveNow = item.status !== 激活码状态枚举.已禁用 && !!expiresAtTime && expiresAtTime > now;

    return {
      ...item,
      isExpired,
      isActiveNow,
      remainingSeconds,
      realtimeStatusText: isExpired ? '已到期' : isActiveNow ? '有效中' : item.status
    };
  }
}
