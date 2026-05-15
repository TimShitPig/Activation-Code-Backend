FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 7789

CMD ["npm", "run", "dev"]
