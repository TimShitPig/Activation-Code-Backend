FROM node:22-alpine AS builder

WORKDIR /workspace
ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./
COPY 后端服务/package.json ./后端服务/package.json
COPY 管理后台/package.json ./管理后台/package.json
RUN npm install --no-audit --no-fund --network-timeout=600000

COPY . .
ENV VITE_API_BASE=/api
RUN npm run build -w 管理后台
RUN npm run build -w 后端服务

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7790
ENV SYSTEM_CONFIG_PATH=/app/data/系统配置.json
ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./
COPY 后端服务/package.json ./后端服务/package.json
COPY 管理后台/package.json ./管理后台/package.json
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/后端服务/node_modules ./后端服务/node_modules
COPY --from=builder /workspace/管理后台/node_modules ./管理后台/node_modules

COPY --from=builder /workspace/后端服务/dist ./后端服务/dist
COPY --from=builder /workspace/管理后台/dist ./管理后台/dist

EXPOSE 7790

CMD ["node", "后端服务/dist/main.js"]
