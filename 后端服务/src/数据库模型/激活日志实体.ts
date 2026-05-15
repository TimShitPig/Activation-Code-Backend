import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { 日志结果枚举 } from './业务枚举';

@Entity('activation_logs')
export class 激活日志实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'action', length: 64, comment: '动作：激活或校验' })
  action: string;

  @Column({ name: 'subject_type', length: 32, default: 'qq', comment: '主体类型' })
  subjectType: string;

  @Column({ name: 'subject_id', length: 128, comment: '主体ID' })
  subjectId: string;

  @Column({ name: 'code', type: 'varchar', length: 64, nullable: true, comment: '激活码' })
  code: string | null;

  @Column({ name: 'result', type: 'varchar', length: 32, comment: '结果' })
  result: 日志结果枚举;

  @Column({ name: 'message', length: 255, comment: '中文提示' })
  message: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true, comment: '到期时间' })
  expiresAt: Date | null;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true, comment: '客户端IP' })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true, comment: '客户端UA' })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', comment: '记录时间' })
  createdAt: Date;
}
