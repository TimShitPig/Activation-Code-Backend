import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { 日志结果枚举 } from './业务枚举';

@Entity('operation_logs')
export class 操作日志实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', nullable: true, comment: '管理员ID' })
  adminId: number | null;

  @Column({ name: 'admin_username', length: 64, nullable: true, comment: '管理员账号' })
  adminUsername: string | null;

  @Column({ name: 'action', length: 64, comment: '操作动作' })
  action: string;

  @Column({ name: 'target_type', length: 64, nullable: true, comment: '目标类型' })
  targetType: string | null;

  @Column({ name: 'target_id', length: 128, nullable: true, comment: '目标ID' })
  targetId: string | null;

  @Column({ name: 'result', type: 'varchar', length: 32, default: 日志结果枚举.成功, comment: '操作结果' })
  result: 日志结果枚举;

  @Column({ name: 'detail', type: 'text', nullable: true, comment: '详情' })
  detail: string | null;

  @Column({ name: 'ip', length: 64, nullable: true, comment: 'IP地址' })
  ip: string | null;

  @CreateDateColumn({ name: 'created_at', comment: '记录时间' })
  createdAt: Date;
}

