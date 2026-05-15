export interface 数据库配置 {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface 系统配置 {
  database: 数据库配置;
  admin: {
    username: string;
    password: string;
  };
  jwtSecret: string;
  jwtExpiresIn: string;
  robotApiToken: string;
  corsOrigin: string;
  initializedAt: string;
}

