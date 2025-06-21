# Dockerfile for api-gateway
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

# Build only the api-gateway
RUN npm run build api-gateway

EXPOSE 3000

WORKDIR /app

CMD ["node", "dist/apps/api-gateway/main.js"] 