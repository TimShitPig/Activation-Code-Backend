import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { 卡类型枚举, 使用模式枚举 } from './业务枚举';
import { 激活码实体 } from './激活码实体';

@Entity('activation_code_batches')
export class 激活码批次实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_name', length: 120, comment: '批次名称' })
  batchName: string;

  @Column({ name: 'card_type', type: 'varchar', length: 32, comment: '卡类型' })
  cardType: 卡类型枚举;

  @Column({ name: 'use_mode', type: 'varchar', length: 32, comment: '使用模式' })
  useMode: 使用模式枚举;

  @Column({ name: 'total_count', comment: '生成数量' })
  totalCount: number;

  @Column({ name: 'max_uses', default: 1, comment: '单码最大使用人数或次数' })
  maxUses: number;

  @Column({ name: 'created_by', type: 'int', nullable: true, comment: '创建管理员ID' })
  createdBy: number | null;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @OneToMany(() => 激活码实体, (code) => code.batch)
  codes: 激活码实体[];
}
