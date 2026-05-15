FROM node:22-alpine AS builder

WORKDIR /workspace
ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./
COPY 后端服务/package.json ./后端服务/package.json
COPY 管理后台/package.json ./管理后台/package.json
RUN npm install --no-audit --no-fund --network-timeout=600000

COPY . .
ARG APP_COMMIT=unknown
ARG APP_VERSION=
ENV APP_COMMIT=${APP_COMMIT}
ENV APP_VERSION=${APP_VERSION}
ENV VITE_API_BASE=/api
RUN node -e "const fs=require('fs');const pkg=require('./package.json');fs.writeFileSync('版本信息.json',JSON.stringify({version:process.env.APP_VERSION||pkg.version||'unknown',commit:process.env.APP_COMMIT||'unknown',buildTime:new Date().toISOString(),source:'docker'},null,2));"
RUN npm run build -w 管理后台
RUN npm run build -w 后端服务

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7790
ENV SYSTEM_CONFIG_PATH=/app/data/系统配置.json
ENV npm_config_registry=https://registry.npmmirror.com
ARG ALPINE_REPOSITORY=https://mirrors.aliyun.com/alpine
RUN alpine_version="$(cut -d. -f1,2 /etc/alpine-release)" \
  && printf "%s/v%s/main\n%s/v%s/community\n" "$ALPINE_REPOSITORY" "$alpine_version" "$ALPINE_REPOSITORY" "$alpine_version" > /etc/apk/repositories \
  && apk add --no-cache git docker-cli docker-cli-compose

COPY package*.json ./
COPY 后端服务/package.json ./后端服务/package.json
COPY 管理后台/package.json ./管理后台/package.json
COPY --from=builder /workspace/node_modules ./node_modules

COPY --from=builder /workspace/后端服务/dist ./后端服务/dist
COPY --from=builder /workspace/管理后台/dist ./管理后台/dist
COPY --from=builder /workspace/版本信息.json ./版本信息.json

EXPOSE 7790

CMD ["node", "后端服务/dist/main.js"]
