# Instagram Clone - Microservices Architecture

A scalable social media application built with NestJS microservices architecture, featuring real-time notifications, user management, post creation, and more.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - User registration and login
  - Password hashing and security

- **User Management**
  - User profiles and information
  - Follow/unfollow functionality
  - Follower/following lists
  - User search capabilities

- **Post Management**
  - Create posts with captions and media URLs
  - Personal feed (user's own posts)
  - Discovery feed (posts from followed users)
  - Post retrieval and pagination

- **Real-time Notifications**
  - Follow notifications
  - Post creation notifications
  - Real-time event processing via RabbitMQ
  - Notification history and management

### Technical Features
- **Microservices Architecture**
  - Service-to-service communication
  - Event-driven architecture
  - Load balancing and scalability
  - Fault tolerance and resilience

- **Database Integration**
  - MongoDB for posts and notifications
  - PostgreSQL for user data
  - Redis for caching and session management

- **Message Queue System**
  - RabbitMQ for event processing
  - Asynchronous communication
  - Event sourcing and replay

## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Auth Service   │    │  User Service   │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Post Service   │    │Notification Svc │    │   RabbitMQ      │
│   (Port 3003)   │    │   (Port 3004)   │    │   (Port 5672)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   PostgreSQL    │    │     Redis       │
│  (Posts/Notif)  │    │    (Users)      │    │   (Cache)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Responsibilities

#### 1. API Gateway (Port 3000)
- **Purpose**: Single entry point for all client requests
- **Responsibilities**:
  - Request routing and load balancing
  - Authentication and authorization
  - Request/response transformation
  - Rate limiting and caching
  - API documentation (Swagger)

#### 2. Auth Service (Port 3001)
- **Purpose**: Handle user authentication and authorization
- **Responsibilities**:
  - User registration and login
  - JWT token generation and validation
  - Password hashing and verification
  - Session management

#### 3. User Service (Port 3002)
- **Purpose**: Manage user data and relationships
- **Responsibilities**:
  - User profile management
  - Follow/unfollow functionality
  - Follower/following lists
  - User search and discovery

#### 4. Post Service (Port 3003)
- **Purpose**: Handle post creation and management
- **Responsibilities**:
  - Post creation and storage
  - Feed generation (personal and discovery)
  - Post retrieval and pagination
  - Event emission for notifications

#### 5. Notification Service (Port 3004)
- **Purpose**: Handle real-time notifications
- **Responsibilities**:
  - Event processing and notification creation
  - Notification storage and retrieval
  - Real-time notification delivery
  - Notification management (read/unread)

### Communication Patterns

#### 1. Synchronous Communication (TCP)
- Direct service-to-service calls
- Request/response pattern
- Used for immediate data retrieval

#### 2. Asynchronous Communication (RabbitMQ)
- Event-driven communication
- Publisher/subscriber pattern
- Used for notifications and background processing

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Microservices**: NestJS Microservices
- **Message Queue**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)

### Databases
- **Primary Database**: PostgreSQL (Users)
- **Document Database**: MongoDB (Posts, Notifications)
- **Cache**: Redis

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd instaclone-microservices
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Database URLs
POSTGRES_URI=postgresql://postgres:password@user-db:5432/users
POST_DB_URI=mongodb://post-db:27017/posts
NOTIFICATION_DB_URI=mongodb://notification-db:27017/notification-service

# RabbitMQ
RABBITMQ_URI=amqp://rabbitmq:5672

# Service Hosts
USER_SERVICE_HOST=user-service
USER_SERVICE_TCP_PORT=3002
POST_SERVICE_HOST=post-service
POST_SERVICE_TCP_PORT=3003
NOTIFICATION_SERVICE_HOST=notification-service
NOTIFICATION_SERVICE_TCP_PORT=3004
```

### 4. Start All Services
```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d --build
```

### 5. Verify Services
Check if all services are running:
```bash
docker-compose ps
```

### 6. Access the Application
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### User Management Endpoints

#### Follow User
```http
POST /users/follow
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIdToFollow": "user-id-here"
}
```

#### Get Followers
```http
GET /users/followers
Authorization: Bearer <token>
```

#### Get Following
```http
GET /users/following
Authorization: Bearer <token>
```

### Post Management Endpoints

#### Create Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "caption": "My awesome post!",
  "mediaUrl": "https://example.com/image.jpg"
}
```

#### Get Personal Feed
```http
GET /posts/feed
Authorization: Bearer <token>
```

### Notification Endpoints

#### Get My Notifications
```http
GET /notifications/my
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
POST /notifications/:notificationId/read
Authorization: Bearer <token>
```

## 🔄 Data Flow Examples

### 1. User Registration Flow
```
Client → API Gateway → Auth Service → PostgreSQL
                ↓
            JWT Token → Client
```

### 2. Post Creation Flow
```
Client → API Gateway → Post Service → MongoDB
                ↓
            Post Created Event → RabbitMQ → Notification Service
                ↓
            Notifications → Followers
```

### 3. Follow User Flow
```
Client → API Gateway → User Service → PostgreSQL
                ↓
            Follow Event → RabbitMQ → Notification Service
                ↓
            Notification → Followed User
```

