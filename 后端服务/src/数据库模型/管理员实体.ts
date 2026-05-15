import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('admins')
export class 管理员实体 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'username', unique: true, length: 64, comment: '管理员账号' })
  username: string;

  @Column({ name: 'password_hash', length: 255, comment: '密码哈希' })
  passwordHash: string;

  @Column({ name: 'is_enabled', default: true, comment: '是否启用' })
  isEnabled: boolean;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}

