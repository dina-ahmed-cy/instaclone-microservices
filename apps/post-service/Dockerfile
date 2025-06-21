# Dockerfile for post-service
FROM node:20-alpine
WORKDIR /app
COPY ../../package*.json ./
COPY ../../tsconfig*.json ./
COPY . .
RUN npm install --legacy-peer-deps && npm run build
EXPOSE 3003
CMD ["node", "dist/apps/post-service/main.js"] 