import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { 卡类型枚举, 使用模式枚举, 激活码状态枚举 } from './业务枚举';
import { 激活码批次实体 } from './激活码批次实体';
import { 兑换记录实体 } from './兑换记录实体';

@Entity('activation_codes')
export class 激活码实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'code', length: 64, comment: '激活码' })
  code: string;

  @Column({ name: 'card_type', type: 'varchar', length: 32, comment: '卡类型' })
  cardType: 卡类型枚举;

  @Column({ name: 'duration_days', comment: '有效天数' })
  durationDays: number;

  @Column({ name: 'use_mode', type: 'varchar', length: 32, comment: '使用模式' })
  useMode: 使用模式枚举;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 32,
    default: 激活码状态枚举.未使用,
    comment: '激活码状态'
  })
  status: 激活码状态枚举;

  @Column({ name: 'max_uses', default: 1, comment: '最大使用人数或次数' })
  maxUses: number;

  @Column({ name: 'used_count', default: 0, comment: '已使用次数' })
  usedCount: number;

  @Column({ name: 'batch_id', nullable: true, comment: '批次ID' })
  batchId: number | null;

  @Column({ name: 'activated_at', type: 'datetime', nullable: true, comment: '首次激活时间' })
  activatedAt: Date | null;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true, comment: '最近一次激活后的到期时间' })
  expiresAt: Date | null;

  @Column({ name: 'bound_subject_type', length: 32, nullable: true, comment: '绑定主体类型' })
  boundSubjectType: string | null;

  @Column({ name: 'bound_subject_id', length: 128, nullable: true, comment: '绑定主体ID' })
  boundSubjectId: string | null;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ name: 'created_at', comment: '生成时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @ManyToOne(() => 激活码批次实体, (batch) => batch.codes, { nullable: true })
  @JoinColumn({ name: 'batch_id' })
  batch: 激活码批次实体 | null;

  @OneToMany(() => 兑换记录实体, (record) => record.codeEntity)
  redemptions: 兑换记录实体[];
}

