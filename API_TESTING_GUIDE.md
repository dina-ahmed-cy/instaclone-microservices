# Instaclone Microservices API Testing Guide

## 🚀 Quick Start

Your microservices are now running successfully! Here's how to test them:

### Base URL
- **API Gateway**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api`

## 📋 Available Endpoints

### 1. Health Check
- **GET** `/` - Check if API Gateway is running

### 2. Authentication Endpoints

#### Register User
- **POST** `/auth/register`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Response**: User data + access & refresh tokens

#### Login User
- **POST** `/auth/login`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Response**: Access & refresh tokens

#### Refresh Token
- **POST** `/auth/refresh`
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response**: New access & refresh tokens

#### Logout
- **POST** `/auth/logout`
- **Headers**: `Authorization: Bearer <access_token>`

### 3. Posts Endpoints

#### Create Post
- **POST** `/posts`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**:
```json
{
  "caption": "This is my first post!",
  "mediaUrl": "https://example.com/image.jpg"
}
```

#### Get User Feed
- **GET** `/posts/feed`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Array of user's posts

## 🧪 Testing with Postman

### Step 1: Import the Collection
1. Open Postman
2. Click "Import" 
3. Select the `Instaclone-API.postman_collection.json` file

### Step 2: Test the Flow

#### 1. Health Check
- Run the "Health Check" request
- Should return a simple message confirming the API is running

#### 2. Register a New User
- Run "Register User" with:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected Response**: 201 Created with user data and tokens
- The tokens will be automatically saved to collection variables

#### 3. Login (Alternative to Register)
- If you already have a user, use "Login User"
- Same credentials as above
- **Expected Response**: 200 OK with tokens

#### 4. Create a Post
- Run "Create Post" with:
```json
{
  "caption": "Hello World!",
  "mediaUrl": "https://picsum.photos/500/500"
}
```
- **Expected Response**: 201 Created with post data

#### 5. Get User Feed
- Run "Get User Feed"
- **Expected Response**: 200 OK with array of posts

#### 6. Refresh Token (Optional)
- If your access token expires, use "Refresh Token"
- Uses the refresh token automatically

#### 7. Logout
- Run "Logout" to invalidate the session

## 🔧 Manual Testing with cURL

### Health Check
```bash
curl http://localhost:3000/
```

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Post (Replace TOKEN with actual access token)
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "caption": "My first post!",
    "mediaUrl": "https://picsum.photos/500/500"
  }'
```

### Get Feed (Replace TOKEN with actual access token)
```bash
curl -X GET http://localhost:3000/posts/feed \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Expected Response Formats

### Successful Registration/Login
```json
{
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Successful Post Creation
```json
{
  "id": "post-id",
  "caption": "This is my first post!",
  "mediaUrl": "https://example.com/image.jpg",
  "userId": "user-id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### User Feed
```json
[
  {
    "id": "post-id-1",
    "caption": "First post",
    "mediaUrl": "https://example.com/image1.jpg",
    "userId": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "post-id-2",
    "caption": "Second post",
    "mediaUrl": "https://example.com/image2.jpg",
    "userId": "user-id",
    "createdAt": "2024-01-01T01:00:00.000Z"
  }
]
```

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if your access token is valid
   - Try refreshing the token
   - Make sure you're logged in

2. **400 Bad Request**
   - Check request body format
   - Ensure all required fields are present
   - Validate email format and password length (min 8 characters)

3. **409 Conflict**
   - Email already exists (during registration)
   - Try a different email address

4. **500 Internal Server Error**
   - Check if all microservices are running
   - Check Docker container logs

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api-gateway
docker-compose logs auth-service
docker-compose logs post-service
```

## 🔍 Additional Tools

### Swagger Documentation
Visit `http://localhost:3000/api` for interactive API documentation.

### RabbitMQ Management
Visit `http://localhost:15672` to monitor message queues:
- Username: `guest`
- Password: `guest`

### Redis Monitoring
You can use Redis CLI to monitor cache:
```bash
docker exec -it instaclone-microservices-redis-1 redis-cli
```

## 🎯 Testing Scenarios

### Scenario 1: Complete User Journey
1. Register new user
2. Login with credentials
3. Create multiple posts
4. View user feed
5. Logout

### Scenario 2: Token Management
1. Login user
2. Use access token for API calls
3. Wait for token expiration (or simulate)
4. Use refresh token to get new access token
5. Continue using API

### Scenario 3: Error Handling
1. Try to register with existing email
2. Try to login with wrong password
3. Try to access protected endpoints without token
4. Try to create post with invalid media URL

Happy Testing! 🚀 