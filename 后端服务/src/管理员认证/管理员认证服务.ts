import {
  Injectable,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { 管理员实体 } from '../数据库模型/管理员实体';
import { 登录请求 } from './登录请求';
import { 修改密码请求 } from './修改密码请求';
import { 当前管理员 } from './当前管理员';
import { 数据库连接服务 } from '../系统设置/数据库连接服务';

@Injectable()
export class 管理员认证服务 {
  constructor(
    private readonly jwt服务: JwtService,
    private readonly 数据库连接服务: 数据库连接服务
  ) {}

  async 登录(dto: 登录请求) {
    const 管理员仓库 = await this.数据库连接服务.获取仓库(管理员实体);
    const admin = await 管理员仓库.findOne({ where: { username: dto.username } });
    if (!admin || !admin.isEnabled) {
      throw new UnauthorizedException('管理员账号或密码错误');
    }

    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('管理员账号或密码错误');
    }

    admin.lastLoginAt = new Date();
    await 管理员仓库.save(admin);

    const token = await this.jwt服务.signAsync({
      sub: admin.id,
      username: admin.username
    });

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        lastLoginAt: admin.lastLoginAt
      }
    };
  }

  async 当前管理员信息(current: 当前管理员) {
    const 管理员仓库 = await this.数据库连接服务.获取仓库(管理员实体);
    const admin = await 管理员仓库.findOne({ where: { id: current.id } });
    if (!admin || !admin.isEnabled) {
      throw new UnauthorizedException('管理员不存在或已被禁用');
    }
    return {
      id: admin.id,
      username: admin.username,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt
    };
  }

  async 修改密码(current: 当前管理员, dto: 修改密码请求) {
    const 管理员仓库 = await this.数据库连接服务.获取仓库(管理员实体);
    const admin = await 管理员仓库.findOne({ where: { id: current.id } });
    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }
    const ok = await bcrypt.compare(dto.oldPassword, admin.passwordHash);
    if (!ok) {
      throw new BadRequestException('旧密码不正确');
    }
    admin.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await 管理员仓库.save(admin);
    return { message: '密码修改成功' };
  }
}
