# Dockerfile for auth-service
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

# Build only the auth-service
RUN npm run build auth-service

EXPOSE 3001

WORKDIR /app

CMD ["node", "dist/apps/auth-service/main.js"] 