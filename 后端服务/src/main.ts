import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './应用模块';
import { 中文响应拦截器 } from './通用模块/中文响应拦截器';
import { 全局异常过滤器 } from './通用模块/全局异常过滤器';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false
    })
  );
  app.useGlobalInterceptors(new 中文响应拦截器());
  app.useGlobalFilters(new 全局异常过滤器());

  const corsOrigin = config.get<string>('CORS_ORIGIN') || 'http://localhost:7788';
  app.enableCors({
    origin: corsOrigin.split(',').map((item) => item.trim()),
    credentials: true
  });

  const port = config.get<number>('PORT') || 7789;
  await app.listen(port);
  console.log(`激活码后端服务已启动：http://localhost:${port}/api`);
}

bootstrap();
