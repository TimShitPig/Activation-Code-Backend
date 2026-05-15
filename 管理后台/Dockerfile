FROM node:22-alpine

WORKDIR /app

ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline --network-timeout=600000

COPY . .

EXPOSE 7788

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
