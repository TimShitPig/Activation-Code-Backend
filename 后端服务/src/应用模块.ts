import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 管理员实体 } from './数据库模型/管理员实体';
import { 激活码批次实体 } from './数据库模型/激活码批次实体';
import { 激活码实体 } from './数据库模型/激活码实体';
import { 兑换记录实体 } from './数据库模型/兑换记录实体';
import { 会员有效期实体 } from './数据库模型/会员有效期实体';
import { 操作日志实体 } from './数据库模型/操作日志实体';
import { 激活日志实体 } from './数据库模型/激活日志实体';
import { 管理员认证模块 } from './管理员认证/管理员认证模块';
import { 激活码管理模块 } from './激活码管理/激活码管理模块';
import { 机器人接口模块 } from './机器人接口/机器人接口模块';
import { 操作日志模块 } from './操作日志/操作日志模块';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../部署配置/.env.example', '部署配置/.env.example']
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('MYSQL_HOST'),
        port: Number(config.get<number>('MYSQL_PORT') || 3306),
        username: config.get<string>('MYSQL_USER'),
        password: config.get<string>('MYSQL_PASSWORD'),
        database: config.get<string>('MYSQL_DATABASE'),
        charset: 'utf8mb4',
        entities: [
          管理员实体,
          激活码批次实体,
          激活码实体,
          兑换记录实体,
          会员有效期实体,
          操作日志实体,
          激活日志实体
        ],
        synchronize: true,
        logging: false
      })
    }),
    管理员认证模块,
    激活码管理模块,
    机器人接口模块,
    操作日志模块
  ]
})
export class AppModule {}

