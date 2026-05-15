import { Request } from 'express';

export function 读取客户端IP(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || request.socket.remoteAddress || '';
}

export function 读取用户代理(request: Request): string {
  const agent = request.headers['user-agent'];
  return typeof agent === 'string' ? agent : '';
}

