# Instagram Clone - Microservices Architecture

A scalable social media application built with NestJS microservices architecture, featuring real-time notifications, user management, post creation, and more.

## �� Features

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
  - **Separate databases for each service** for optimal performance and data isolation
  - MongoDB for posts and notifications
  - PostgreSQL for user data
  - Redis for caching and session management

- **Message Queue System**
  - RabbitMQ for event processing
  - Asynchronous communication
  - Event sourcing and replay

## 📚 API Documentation & Testing

### Postman Collection
📋 **Complete API Collection**: [Instaclone-API.postman_collection.json](Instaclone-API.postman_collection.json)

Import this collection into Postman to test all endpoints with pre-configured requests, environment variables, and example data.

### API Endpoints Overview
- **Authentication**: `/auth/*` - Registration, login, token management
- **Users**: `/users/*` - Profile management, follow/unfollow
- **Posts**: `/posts/*` - Post creation, feeds, retrieval
- **Notifications**: `/notifications/*` - Real-time notifications

## ��️ Architecture

### Microservices Overview
