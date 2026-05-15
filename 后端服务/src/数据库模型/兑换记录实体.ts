import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { 激活码实体 } from './激活码实体';

@Entity('code_redemptions')
@Index(['codeId', 'subjectType', 'subjectId'])
export class 兑换记录实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'code_id', comment: '激活码ID' })
  codeId: number;

  @Column({ name: 'subject_type', length: 32, default: 'qq', comment: '主体类型' })
  subjectType: string;

  @Column({ name: 'subject_id', length: 128, comment: '主体ID' })
  subjectId: string;

  @Column({ name: 'started_at', type: 'datetime', comment: '本次续费开始时间' })
  startedAt: Date;

  @Column({ name: 'expires_at', type: 'datetime', comment: '本次续费后到期时间' })
  expiresAt: Date;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true, comment: '客户端IP' })
  ip: string | null;

  @CreateDateColumn({ name: 'created_at', comment: '兑换时间' })
  createdAt: Date;

  @ManyToOne(() => 激活码实体, (code) => code.redemptions)
  @JoinColumn({ name: 'code_id' })
  codeEntity: 激活码实体;
}
