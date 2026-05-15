# 中文化激活码后端与管理后台

这是一个面向机器人授权、QQ 号会员授权、软件卡密分发的中文化激活码管理系统。项目包含 NestJS 后端、React/Vite 管理后台、Docker 开发部署配置、网页初始化向导、远程 MySQL 数据库连接、机器人激活接口和实时剩余时间展示。

## 核心特点

- 全中文管理后台：登录、初始化、概览、激活码列表、日志中心、管理员设置。
- 网页初始化：第一次部署后直接打开网页填写 MySQL、管理员账号、机器人密钥。
- 远程 MySQL：不在 Docker 中内置数据库，适合连接云数据库或已有 MySQL。
- Docker 一键启动：`docker compose -f docker-compose.dev.yml up -d --build`。
- 实时业务更新：机器人激活后后台自动刷新显示已激活、有效中、剩余时间。
- 到期状态展示：后台自动计算已到期、有效中和剩余时间。
- 批量管理：批量禁用、启用、删除、导出 CSV。
- 日志追踪：管理员操作日志、QQ 激活日志、QQ 校验日志。
- 中文分类目录：后端、前端、部署配置、项目文档按中文目录分类。

## 技术栈

- 后端：NestJS、TypeScript、TypeORM、MySQL
- 管理后台：React、Vite、TypeScript、Lucide Icons
- 部署：Docker Compose
- 数据库：MySQL 8 兼容版本

## 目录结构

```text
Activation-Code-Backend/
├─ 后端服务/              # NestJS 后端服务
│  ├─ src/
│  │  ├─ 系统设置/        # 网页初始化、配置保存、动态数据库连接
│  │  ├─ 管理员认证/      # 登录、JWT、修改密码
│  │  ├─ 激活码管理/      # 生成、查询、禁用、删除、批量、导出
│  │  ├─ 机器人接口/      # QQ 激活、QQ 校验
│  │  ├─ 操作日志/        # 管理员日志、激活日志
│  │  ├─ 数据库模型/      # MySQL 实体
│  │  └─ 通用模块/        # 响应格式、异常处理、请求信息
│  └─ Dockerfile
├─ 管理后台/              # React 管理后台
│  ├─ src/
│  │  ├─ 初始化设置/      # 第一次部署网页配置
│  │  ├─ 登录页面/
│  │  ├─ 首页概览/
│  │  ├─ 激活码列表/
│  │  ├─ 生成激活码/
│  │  ├─ 批量操作/
│  │  ├─ 日志中心/
│  │  ├─ 管理员设置/
│  │  ├─ 通用组件/
│  │  └─ 接口服务/
│  └─ Dockerfile
├─ 部署配置/              # 启动说明、环境变量示例
├─ 项目文档/              # 接口说明、数据库说明、功能说明
├─ docker-compose.dev.yml # Docker 开发/部署配置
├─ package.json
└─ README.md
```

## 一键部署

服务器需要先安装 Docker 和 Docker Compose。

```bash
git clone https://github.com/TimShitPig/Activation-Code-Backend.git
cd Activation-Code-Backend
docker compose -f docker-compose.dev.yml up -d --build
```

启动后访问：

```text
http://服务器IP:7788
```

后端接口地址：

```text
http://服务器IP:7789/api
```

## 第一次网页初始化

第一次打开管理后台时，系统会显示“系统初始化设置”页面。

需要填写：

- MySQL 地址
- MySQL 端口，默认 `3306`
- MySQL 账号
- MySQL 密码
- 数据库名，默认 `activation_system`
- 管理员账号
- 管理员密码
- 机器人密钥，可留空自动生成
- 后台访问地址

点击“测试数据库连接”确认 MySQL 可连接，再点击“保存并初始化”。

初始化成功后系统会：

- 保存配置到 `数据/系统配置.json`
- 自动连接 MySQL
- 自动创建数据表
- 自动创建管理员账号
- 生成或保存机器人密钥
- 进入登录页

`数据/` 目录已经被 Docker 挂载，容器重建后配置不会丢失。

## 准备 MySQL 数据库

需要提前在远程 MySQL 创建数据库：

```sql
CREATE DATABASE activation_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

如果你使用其他数据库名，网页初始化时填写对应名称即可。

## 管理后台功能

### 首页概览

- 激活码总数
- 未使用数量
- 已激活数量
- 有效中数量
- 已到期数量
- 部分使用数量
- 已禁用数量
- 今日激活数量

首页会每 5 秒自动刷新。

### 激活码列表

支持查看：

- 激活码
- 卡类型
- 使用模式
- 状态
- 使用次数
- 绑定 QQ
- 生成时间
- 激活时间
- 到期时间
- 剩余时间

激活码列表也会每 5 秒自动刷新。机器人激活成功后，后台会自动显示“有效中”和剩余时间；到期后会自动显示“已到期”。

### 生成激活码

支持卡类型：

- 日卡：1 天
- 三天卡：3 天
- 周卡：7 天
- 月卡：30 天
- 季卡：90 天
- 半年卡：180 天
- 年卡：365 天

支持使用模式：

- 一次性卡：一张码只能一个 QQ 使用。
- 多人一次性卡：一张码可设置最大使用人数，每个 QQ 只能使用一次。
- 重复卡：允许重复兑换，适合测试码或特殊通用码。

### 批量操作

- 批量禁用
- 批量启用
- 批量删除
- 导出 CSV

### 日志中心

- 管理员操作日志
- QQ 激活日志
- QQ 校验日志
- 成功/失败结果
- IP 地址
- 到期时间
- 中文提示信息

### 管理员设置

- 查看当前管理员
- 修改管理员密码

## 机器人接口

机器人接口需要请求头：

```http
X-API-Token: 初始化时填写或自动生成的机器人密钥
```

### QQ 激活

```http
POST /api/client/activate
Content-Type: application/json
X-API-Token: 你的机器人密钥

{
  "subjectType": "qq",
  "subjectId": "123456789",
  "code": "ABCD-EFGH-IJKL-MNOP-QRSTUVWX"
}
```

返回示例：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "active": true,
    "subjectType": "qq",
    "subjectId": "123456789",
    "expiresAt": "2026-06-15T08:00:00.000Z",
    "message": "激活成功，会员时长已叠加"
  }
}
```

### QQ 校验

```http
POST /api/client/check
Content-Type: application/json
X-API-Token: 你的机器人密钥

{
  "subjectType": "qq",
  "subjectId": "123456789"
}
```

返回示例：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "active": true,
    "subjectType": "qq",
    "subjectId": "123456789",
    "expiresAt": "2026-06-15T08:00:00.000Z",
    "message": "会员有效"
  }
}
```

## 管理员 API

- `POST /api/admin/auth/login` 管理员登录
- `GET /api/admin/profile` 获取当前管理员
- `POST /api/admin/change-password` 修改密码

## 激活码 API

- `POST /api/admin/codes/generate` 生成激活码
- `GET /api/admin/codes` 查询激活码列表
- `GET /api/admin/codes/stats` 首页统计
- `PATCH /api/admin/codes/:id/disable` 禁用激活码
- `PATCH /api/admin/codes/:id/enable` 启用激活码
- `DELETE /api/admin/codes/:id` 删除激活码
- `POST /api/admin/codes/bulk` 批量操作
- `GET /api/admin/codes/export` 导出 CSV

## 初始化 API

- `GET /api/setup/status` 查看系统是否已初始化
- `POST /api/setup/test-database` 测试数据库连接
- `POST /api/setup/initialize` 保存初始化配置并创建数据表

## Docker 热更新

当前 `docker-compose.dev.yml` 使用源码挂载：

- 修改 `后端服务/` 代码后，NestJS watch 自动重启。
- 修改 `管理后台/` 代码后，Vite HMR 自动刷新页面。
- Windows 下已启用 polling，文件变更更稳定。

```yaml
CHOKIDAR_USEPOLLING: "true"
WATCHPACK_POLLING: "true"
```

## 更新服务器代码

每次本地修改并推送 GitHub 后，服务器执行：

```bash
cd Activation-Code-Backend
git pull
docker compose -f docker-compose.dev.yml up -d --build
```

配置文件 `数据/系统配置.json` 不会被 Git 覆盖。

## 本地开发

如果不使用 Docker：

```powershell
npm.cmd install
npm.cmd run dev -w 后端服务
npm.cmd run dev -w 管理后台
```

访问：

```text
http://localhost:7788
```

## 构建检查

```powershell
npm.cmd run typecheck -w 后端服务
npm.cmd run typecheck -w 管理后台
npm.cmd run build -w 后端服务
npm.cmd run build -w 管理后台
```

## 常见问题

### 1. 打开后台后一直显示初始化页面

说明 `数据/系统配置.json` 不存在，或者容器没有挂载 `./数据:/app/data`。请检查 Docker Compose 配置。

### 2. 数据库连接失败

检查：

- MySQL 地址是否能从服务器访问
- MySQL 端口是否开放
- 数据库账号密码是否正确
- 数据库是否已创建
- 云数据库白名单是否允许服务器 IP

### 3. 机器人接口提示密钥不正确

请使用初始化页面保存的机器人密钥。密钥保存在：

```text
数据/系统配置.json
```

### 4. 后台没有立刻看到激活状态

后台列表和首页每 5 秒自动刷新一次。也可以点击“刷新”按钮立即更新。

## 安全提醒

- 不要把真实数据库密码提交到 GitHub。
- `数据/` 已加入 `.gitignore`，不要手动上传该目录。
- 生产环境建议使用强管理员密码。
- 机器人密钥建议使用随机长字符串。
