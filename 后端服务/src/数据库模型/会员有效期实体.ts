import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('memberships')
@Index(['subjectType', 'subjectId'], { unique: true })
export class 会员有效期实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject_type', length: 32, default: 'qq', comment: '主体类型' })
  subjectType: string;

  @Column({ name: 'subject_id', length: 128, comment: '主体ID' })
  subjectId: string;

  @Column({ name: 'expires_at', type: 'datetime', comment: '会员到期时间' })
  expiresAt: Date;

  @Column({ name: 'last_code_id', nullable: true, comment: '最近使用的激活码ID' })
  lastCodeId: number | null;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}

