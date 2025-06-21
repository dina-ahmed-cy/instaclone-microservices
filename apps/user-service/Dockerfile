# Use official Node.js LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json from the monorepo root
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies (for the whole monorepo)
RUN npm install

# Copy the entire monorepo into the container
COPY . .

# Build the user-service from the monorepo root
RUN npm run build user-service

# Expose the TCP port (default 3002)
EXPOSE 3002

# Set working directory to /app before running the service
WORKDIR /app

# Start the user-service microservice
CMD ["node", "dist/apps/user-service/main.js"]