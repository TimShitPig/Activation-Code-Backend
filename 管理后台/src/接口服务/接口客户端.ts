const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7789/api';

interface 接口响应<T> {
  success: boolean;
  message: string;
  data: T;
}

export function 读取令牌() {
  return localStorage.getItem('管理员令牌') || '';
}

export function 保存令牌(token: string) {
  localStorage.setItem('管理员令牌', token);
}

export function 清除令牌() {
  localStorage.removeItem('管理员令牌');
}

export async function 请求<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = 读取令牌();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return (await response.text()) as T;
  }

  const json = (await response.json()) as 接口响应<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

export async function 下载文件(path: string, filename: string) {
  const token = 读取令牌();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!response.ok) throw new Error('导出失败');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
