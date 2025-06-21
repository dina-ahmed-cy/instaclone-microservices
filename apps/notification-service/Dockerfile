# Dockerfile for notification-service
FROM node:18

WORKDIR /app

# Copy package and config files from the monorepo root
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy the entire monorepo
COPY . .

# Build only the notification-service
RUN npm run build notification-service

EXPOSE 3004

WORKDIR /app

CMD ["node", "dist/apps/notification-service/main.js"] 