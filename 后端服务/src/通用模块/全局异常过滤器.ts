import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class 全局异常过滤器 implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = '服务器内部错误';
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const rawMessage = (exceptionResponse as { message: string | string[] }).message;
      message = Array.isArray(rawMessage) ? rawMessage.join('；') : rawMessage;
    } else if (exception instanceof Error && exception.message) {
      message = exception.message;
    }

    if (!(exception instanceof HttpException)) {
      console.error('未处理异常：', exception);
    }

    response.status(status).json({
      success: false,
      message,
      data: null
    });
  }
}
