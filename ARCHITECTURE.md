# Instagram Clone - Architecture Documentation

This document provides detailed architectural information about the Instagram Clone microservices application.

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                 │
│                              (Web/Mobile Applications)                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/HTTPS Requests
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               API GATEWAY LAYER                                 │
│                              (Single Entry Point)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Authentication  │  │ Rate Limiting   │  │ Request Routing │  │ Caching     │ │
│  │ & Authorization │  │ & Throttling    │  │ & Load Balancing│  │ & Storage   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│    BUSINESS LAYER       │ │    BUSINESS LAYER       │ │    BUSINESS LAYER       │
│   (Microservices)       │ │   (Microservices)       │ │   (Microservices)       │
│                         │ │                         │ │                         │
│ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │
│ │   AUTH SERVICE      │ │ │ │   USER SERVICE       │ │ │   POST SERVICE       │ │
│ │   (Port 3001)       │ │ │ │   (Port 3002)        │ │ │   (Port 3003)        │ │
│ └─────────────────────┘ │ │ └─────────────────────┘ │ │ └─────────────────────┘ │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                    │                   │                   │
                    │                   │                   │
                    ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MESSAGE QUEUE LAYER                                │
│                              (Event Processing)                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ user_followed   │  │ post_created    │  │ notifications   │  │ dead_letter │ │
│  │     queue       │  │     queue       │  │     queue       │  │    queue    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION SERVICE LAYER                               │
│                           (Event Handlers)                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Event Handlers  │  │ Notification    │  │ Real-time       │  │ Database    │ │
│  │ & Processors    │  │ Creation        │  │ Delivery        │  │ Storage     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                         │
│                              (Persistence)                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PostgreSQL    │  │    MongoDB      │  │     Redis       │  │   MongoDB   │ │
│  │   (Users)       │  │   (Posts)       │  │   (Cache)       │  │(Notifications)│ │
│  │                 │  │                 │  │                 │  │             │ │
│  │ • User Profiles │  │ • Post Data     │  │ • Session Cache │  │ • Notifications│ │
│  │ • Followers     │  │ • Feed Data     │  │ • Rate Limiting │  │ • Event Logs │ │
│  │ • Relationships │  │ • Media URLs    │  │ • JWT Storage   │  │ • User Prefs │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Communication Patterns

### 1. Synchronous Communication (TCP)

Used for immediate request/response operations where the client needs an immediate result.

```
┌─────────────┐    TCP Request    ┌─────────────┐
│ API Gateway │ ────────────────► │ User Service│
└─────────────┘                   └─────────────┘
       │                                │
       │    TCP Response               │
       │ ◄─────────────────────────────│
       │                               │
```

**Use Cases:**
- User authentication and login
- Post creation and retrieval
- Feed generation
- User profile updates
- Follower/following list retrieval

**Message Patterns:**
- `{ cmd: 'create_post' }`
- `{ cmd: 'get_feed_for_user' }`
- `{ cmd: 'get_user_followers' }`
- `{ cmd: 'follow_user' }`

### 2. Asynchronous Communication (RabbitMQ)

Used for event-driven operations where immediate response is not required.

```
┌─────────────┐    Event: user_followed    ┌─────────────┐
│User Service │ ─────────────────────────► │Notification │
└─────────────┘                            │   Service   │
                                           └─────────────┘
```

**Use Cases:**
- Follow/unfollow notifications
- Post creation notifications
- Background processing
- Event sourcing and replay

**Event Patterns:**
- `user_followed` - When a user follows another user
- `post_created` - When a new post is created

## 📊 Data Flow Examples

### 1. User Registration Flow

```
┌─────────┐    Register Request    ┌─────────────┐    Create User    ┌─────────────┐
│ Client  │ ─────────────────────► │ API Gateway │ ────────────────► │Auth Service │
└─────────┘                        └─────────────┘                   └─────────────┘
       │                                 │                                 │
       │                                 │                                 │
       │                                 │                                 ▼
       │                                 │                         ┌─────────────┐
       │                                 │                         │ PostgreSQL  │
       │                                 │                         │  (Users)     │
       │                                 │                         └─────────────┘
       │                                 │                                 │
       │                                 │                                 │
       │                                 │                                 ▼
       │                                 │                         ┌─────────────┐
       │                                 │                         │   Redis     │
       │                                 │                         │ (Sessions)  │
       │                                 │                         └─────────────┘
       │                                 │                                 │
       │                                 │                                 │
       │                                 │                                 ▼
       │                                 │                         ┌─────────────┐
       │                                 │                         │ JWT Tokens  │
       │                                 │                         │ Generated   │
       │                                 │                         └─────────────┘
       │                                 │                                 │
       │                                 │                                 │
       │                                 │                                 ▼
       │                                 │                         ┌─────────────┐
       │                                 │                         │ API Gateway │
       │                                 │                         └─────────────┘
       │                                 │                                 │
       │                                 │                                 │
       │                                 │                                 ▼
       │                                 │                         ┌─────────────┐
       │                                 │                         │   Client    │
       │                                 │                         │ (Response)  │
       │                                 │                         └─────────────┘
       │                                 │                                 │
       │                                 │                                 │
       │                                 │                                 ▼
       │                                 │                         ┌─────────────┐
       │                                 │                         │   Client    │
       │                                 │                         │ (JWT Token) │
       │                                 │                         └─────────────┘
```

### 2. Post Creation with Notifications Flow

```
┌─────────┐    Create Post    ┌─────────────┐    TCP Call    ┌─────────────┐
│ Client  │ ────────────────► │ API Gateway │ ─────────────► │Post Service │
└─────────┘                   └─────────────┘                └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │   MongoDB   │
       │                               │                       │   (Posts)   │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │Post Created │
       │                               │                       │   Event     │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │  RabbitMQ   │
       │                               │                       │(post_created)│
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │Notification │
       │                               │                       │  Service    │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │ Get User    │
       │                               │                       │ Followers   │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │User Service │
       │                               │                       │(TCP Call)   │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │ PostgreSQL  │
       │                               │                       │(Followers)  │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │Create Notif.│
       │                               │                       │ for Each    │
       │                               │                       │ Follower    │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │   MongoDB   │
       │                               │                       │(Notifications)│
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │Real-time    │
       │                               │                       │Notification │
       │                               │                       │ Delivery    │
       │                               │                       └─────────────┘
       │                               │                              │
       │                               │                              │
       │                               │                              ▼
       │                               │                       ┌─────────────┐
       │                               │                       │   Client    │
       │                               │                       │(Post Data)  │
       │                               │                       └─────────────┘
```

### 3. Follow User Flow

```
┌─────────┐    Follow Request   ┌─────────────┐    TCP Call    ┌─────────────┐
│ Client  │ ──────────────────► │ API Gateway │ ─────────────► │User Service │
└─────────┘                     └─────────────┘                └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │ PostgreSQL  │
       │                                 │                       │(User Rel.)  │
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │Follow Event │
       │                                 │                       │ Generated   │
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │  RabbitMQ   │
       │                                 │                       │(user_followed)│
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │Notification │
       │                                 │                       │  Service    │
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │Create Follow│
       │                                 │                       │ Notification│
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │   MongoDB   │
       │                                 │                       │(Notifications)│
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │Real-time    │
       │                                 │                       │Notification │
       │                                 │                       │ Delivery    │
       │                                 │                       └─────────────┘
       │                                 │                              │
       │                                 │                              │
       │                                 │                              ▼
       │                                 │                       ┌─────────────┐
       │                                 │                       │   Client    │
       │                                 │                       │(Success)    │
       │                                 │                       └─────────────┘
```

## 🗄️ Database Schema

### PostgreSQL (Users Database)

#### Users Table
```sql
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Followers Table
```sql
CREATE TABLE user_follower (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
    followed_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, followed_id)
);
```

### MongoDB (Posts Database)

#### Posts Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  caption: String,
  mediaUrl: String,
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}
```

### MongoDB (Notifications Database)

#### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  type: String, // 'follow' | 'post_created'
  message: String,
  data: {
    followerId: String, // for follow notifications
    postId: String,     // for post notifications
    authorId: String,   // for post notifications
    caption: String,    // for post notifications
    mediaUrl: String    // for post notifications
  },
  read: Boolean,
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}
```

## 🔧 Service Dependencies

### API Gateway Dependencies
- **Auth Service**: User authentication and token validation
- **User Service**: User management operations
- **Post Service**: Post creation and retrieval
- **Notification Service**: Notification management

### Auth Service Dependencies
- **PostgreSQL**: User data storage
- **Redis**: Session management and token storage

### User Service Dependencies
- **PostgreSQL**: User profiles and relationships
- **Notification Service**: Event emission for follow/unfollow

### Post Service Dependencies
- **MongoDB**: Post data storage
- **User Service**: Follower list retrieval for feed generation
- **Notification Service**: Event emission for post creation

### Notification Service Dependencies
- **MongoDB**: Notification storage
- **User Service**: Follower list retrieval
- **RabbitMQ**: Event consumption

## 🚀 Scalability Considerations

### Horizontal Scaling
- Each microservice can be scaled independently
- Load balancers can distribute traffic across multiple instances
- Database read replicas for read-heavy operations

### Vertical Scaling
- Increase container resources (CPU, Memory)
- Optimize database queries and indexes
- Implement caching strategies

### Performance Optimizations
- Redis caching for frequently accessed data
- Database connection pooling
- Asynchronous processing for non-critical operations
- CDN for static assets

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens with short expiration times
- Refresh token rotation
- Role-based access control (RBAC)
- API rate limiting

### Data Protection
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Network Security
- HTTPS/TLS encryption
- Service-to-service authentication
- Network segmentation
- Firewall rules

## 📊 Monitoring & Observability

### Logging
- Structured logging with correlation IDs
- Centralized log aggregation
- Log level management
- Error tracking and alerting

### Metrics
- Service health checks
- Response time monitoring
- Error rate tracking
- Resource utilization metrics

### Tracing
- Distributed tracing across services
- Request flow visualization
- Performance bottleneck identification
- Dependency mapping

---

This architecture documentation provides a comprehensive overview of the Instagram Clone microservices application. For implementation details, refer to the individual service documentation and the main README.md file. 