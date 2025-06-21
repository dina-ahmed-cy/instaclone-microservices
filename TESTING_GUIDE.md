# Testing Guide - Instagram Clone Microservices

This guide provides comprehensive information about testing strategies, test types, and best practices for the Instagram Clone microservices application.

## 🧪 Testing Strategy Overview

### Testing Pyramid
```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← Few, High-level
                    │   (Manual)      │   Business scenarios
                    └─────────────────┘
                           │
                    ┌─────────────────┐
                    │ Integration     │ ← Medium, Service
                    │   Tests         │   interactions
                    └─────────────────┘
                           │
                    ┌─────────────────┐
                    │   Unit Tests    │ ← Many, Fast
                    │   (Automated)   │   Component logic
                    └─────────────────┘
```

### Test Types

#### 1. Unit Tests
- **Purpose**: Test individual functions, methods, and classes
- **Scope**: Isolated components
- **Speed**: Fast execution
- **Tools**: Jest, NestJS testing utilities

#### 2. Integration Tests
- **Purpose**: Test service interactions and database operations
- **Scope**: Service boundaries
- **Speed**: Medium execution
- **Tools**: Jest, Test containers, In-memory databases

#### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Scope**: Full application stack
- **Speed**: Slow execution
- **Tools**: Supertest, Docker Compose

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure Docker is running for integration tests
docker --version
```

### Test Commands

#### Run All Tests
```bash
# Run all tests across all services
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

#### Run Service-Specific Tests
```bash
# API Gateway tests
npm run test:api-gateway

# Auth Service tests
npm run test:auth-service

# User Service tests
npm run test:user-service

# Post Service tests
npm run test:post-service

# Notification Service tests
npm run test:notification-service
```

#### Run E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests for specific service
npm run test:e2e:api-gateway
npm run test:e2e:auth-service
npm run test:e2e:user-service
npm run test:e2e:post-service
npm run test:e2e:notification-service
```

## 📝 Unit Testing Examples

### 1. Service Unit Tests

#### Auth Service Test Example
```typescript
// auth-service.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceService } from './auth-service.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('AuthServiceService', () => {
  let service: AuthServiceService;
  let jwtService: JwtService;
  let userRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthServiceService>(AuthServiceService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
        password: hashedPassword,
      };

      jest.spyOn(service, 'hashPassword').mockResolvedValue(hashedPassword);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
      };

      const mockTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(service, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await service.login(loginDto);

      expect(result).toEqual(mockTokens);
      expect(service.generateTokens).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
```

#### User Service Test Example
```typescript
// user-service.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceService } from './user-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserFollower } from './entities/user-follower.entity';

describe('UserServiceService', () => {
  let service: UserServiceService;
  let userRepository: any;
  let userFollowerRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockUserFollowerRepository = {
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserFollower),
          useValue: mockUserFollowerRepository,
        },
      ],
    }).compile();

    service = module.get<UserServiceService>(UserServiceService);
    userRepository = module.get(getRepositoryToken(User));
    userFollowerRepository = module.get(getRepositoryToken(UserFollower));
  });

  describe('followUser', () => {
    it('should follow user successfully', async () => {
      const followerId = 'follower-id';
      const userIdToFollow = 'user-to-follow-id';

      const mockFollower = { id: followerId, email: 'follower@example.com' };
      const mockUserToFollow = { id: userIdToFollow, email: 'followed@example.com' };

      userRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockUserToFollow);

      userFollowerRepository.findOne.mockResolvedValue(null);
      userFollowerRepository.save.mockResolvedValue({
        id: 'follow-relation-id',
        followerId,
        followedId: userIdToFollow,
      });

      const result = await service.followUser(followerId, userIdToFollow);

      expect(result).toEqual({
        message: 'User followed successfully',
        followerId,
        followedId: userIdToFollow,
      });
      expect(userFollowerRepository.save).toHaveBeenCalledWith({
        followerId,
        followedId: userIdToFollow,
      });
    });

    it('should throw error if trying to follow self', async () => {
      const userId = 'same-user-id';

      await expect(service.followUser(userId, userId)).rejects.toThrow(
        'Cannot follow yourself',
      );
    });

    it('should throw error if already following', async () => {
      const followerId = 'follower-id';
      const userIdToFollow = 'user-to-follow-id';

      const mockFollower = { id: followerId, email: 'follower@example.com' };
      const mockUserToFollow = { id: userIdToFollow, email: 'followed@example.com' };

      userRepository.findOne
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockUserToFollow);

      userFollowerRepository.findOne.mockResolvedValue({
        id: 'existing-relation',
        followerId,
        followedId: userIdToFollow,
      });

      await expect(service.followUser(followerId, userIdToFollow)).rejects.toThrow(
        'Already following this user',
      );
    });
  });

  describe('getFollowers', () => {
    it('should return user followers', async () => {
      const userId = 'user-id';
      const mockFollowers = [
        { id: 'follower1', email: 'follower1@example.com' },
        { id: 'follower2', email: 'follower2@example.com' },
      ];

      userFollowerRepository.find.mockResolvedValue([
        { followerId: 'follower1' },
        { followerId: 'follower2' },
      ]);

      userRepository.find.mockResolvedValue(mockFollowers);

      const result = await service.getFollowers(userId);

      expect(result).toEqual(mockFollowers);
      expect(userFollowerRepository.find).toHaveBeenCalledWith({
        where: { followedId: userId },
      });
    });
  });
});
```

### 2. Controller Unit Tests

#### API Gateway Controller Test Example
```typescript
// posts.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    createPost: jest.fn(),
    getFeedForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const createPostDto: CreatePostDto = {
        caption: 'Test post',
        mediaUrl: 'https://example.com/image.jpg',
      };

      const mockUser = { id: 'user-id', email: 'user@example.com' };
      const mockPost = {
        id: 'post-id',
        userId: mockUser.id,
        caption: createPostDto.caption,
        mediaUrl: createPostDto.mediaUrl,
        createdAt: new Date(),
      };

      mockPostsService.createPost.mockResolvedValue(mockPost);

      const result = await controller.createPost(createPostDto, mockUser);

      expect(result).toEqual(mockPost);
      expect(service.createPost).toHaveBeenCalledWith(createPostDto, mockUser.id);
    });
  });

  describe('getFeed', () => {
    it('should return user feed', async () => {
      const mockUser = { id: 'user-id', email: 'user@example.com' };
      const mockFeed = [
        {
          id: 'post1',
          userId: 'user1',
          caption: 'Post 1',
          mediaUrl: 'https://example.com/image1.jpg',
        },
        {
          id: 'post2',
          userId: 'user2',
          caption: 'Post 2',
          mediaUrl: 'https://example.com/image2.jpg',
        },
      ];

      mockPostsService.getFeedForUser.mockResolvedValue(mockFeed);

      const result = await controller.getFeed(mockUser);

      expect(result).toEqual(mockFeed);
      expect(service.getFeedForUser).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
```

## 🔗 Integration Testing Examples

### 1. Service Integration Tests

#### Auth Service Integration Test
```typescript
// auth-service.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthServiceService } from './auth-service.service';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

describe('AuthServiceService Integration', () => {
  let app: INestApplication;
  let service: AuthServiceService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test_db',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AuthServiceService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<AuthServiceService>(AuthServiceService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration and Login Flow', () => {
    it('should register and login user successfully', async () => {
      // Register user
      const registerDto = {
        email: 'integration@example.com',
        password: 'password123',
      };

      const registeredUser = await service.register(registerDto);
      expect(registeredUser.email).toBe(registerDto.email);
      expect(registeredUser.password).toBeUndefined();

      // Login user
      const loginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResult = await service.login(loginDto);
      expect(loginResult).toHaveProperty('access_token');
      expect(loginResult).toHaveProperty('refresh_token');
    });
  });
});
```

### 2. Microservice Integration Tests

#### API Gateway Integration Test
```typescript
// api-gateway.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

describe('ApiGateway Integration', () => {
  let app: INestApplication;
  let controller: ApiGatewayController;
  let service: ApiGatewayService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'USER_SERVICE',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 3002,
            },
          },
          {
            name: 'POST_SERVICE',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 3003,
            },
          },
        ]),
      ],
      controllers: [ApiGatewayController],
      providers: [ApiGatewayService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    controller = moduleFixture.get<ApiGatewayController>(ApiGatewayController);
    service = moduleFixture.get<ApiGatewayService>(ApiGatewayService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Service Communication', () => {
    it('should communicate with user service', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      
      jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

      const result = await controller.getUser('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should communicate with post service', async () => {
      const mockPost = {
        id: 'post-id',
        userId: 'user-id',
        caption: 'Test post',
        mediaUrl: 'https://example.com/image.jpg',
      };

      jest.spyOn(service, 'createPost').mockResolvedValue(mockPost);

      const createPostDto = {
        caption: 'Test post',
        mediaUrl: 'https://example.com/image.jpg',
      };

      const result = await controller.createPost(createPostDto, { id: 'user-id' });
      expect(result).toEqual(mockPost);
    });
  });
});
```

## 🌐 End-to-End Testing Examples

### 1. Complete User Workflow Test
```typescript
// user-workflow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User Workflow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete User Workflow', () => {
    it('should complete full user workflow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'workflow@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('id');
      expect(registerResponse.body).toHaveProperty('email', 'workflow@example.com');

      // Step 2: Login user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'workflow@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      authToken = loginResponse.body.access_token;
      userId = registerResponse.body.id;

      // Step 3: Create a post
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'My first post!',
          mediaUrl: 'https://example.com/image.jpg',
        })
        .expect(201);

      expect(postResponse.body).toHaveProperty('id');
      expect(postResponse.body).toHaveProperty('caption', 'My first post!');

      // Step 4: Get user feed
      const feedResponse = await request(app.getHttpServer())
        .get('/posts/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(feedResponse.body)).toBe(true);
      expect(feedResponse.body.length).toBeGreaterThan(0);

      // Step 5: Follow another user (if exists)
      const followResponse = await request(app.getHttpServer())
        .post('/users/follow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userIdToFollow: 'another-user-id',
        });

      // This might fail if user doesn't exist, which is expected
      if (followResponse.status === 201) {
        expect(followResponse.body).toHaveProperty('message', 'User followed successfully');
      }

      // Step 6: Get notifications
      const notificationsResponse = await request(app.getHttpServer())
        .get('/notifications/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(notificationsResponse.body)).toBe(true);
    });
  });
});
```

### 2. Notification Flow Test
```typescript
// notification-flow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Notification Flow (e2e)', () => {
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Notification Flow', () => {
    it('should handle follow notification flow', async () => {
      // Create two users
      const user1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user1@example.com',
          password: 'password123',
        })
        .expect(201);

      const user2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user2@example.com',
          password: 'password123',
        })
        .expect(201);

      user1Id = user1Response.body.id;
      user2Id = user2Response.body.id;

      // Login both users
      const user1Login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user1@example.com',
          password: 'password123',
        })
        .expect(200);

      const user2Login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user2@example.com',
          password: 'password123',
        })
        .expect(200);

      user1Token = user1Login.body.access_token;
      user2Token = user2Login.body.access_token;

      // User1 follows User2
      await request(app.getHttpServer())
        .post('/users/follow')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          userIdToFollow: user2Id,
        })
        .expect(201);

      // Wait for notification processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // User2 should have a follow notification
      const notificationsResponse = await request(app.getHttpServer())
        .get('/notifications/my')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(Array.isArray(notificationsResponse.body)).toBe(true);
      expect(notificationsResponse.body.length).toBeGreaterThan(0);
      expect(notificationsResponse.body[0]).toHaveProperty('type', 'follow');
    });

    it('should handle post creation notification flow', async () => {
      // User2 creates a post
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          caption: 'Test post for notifications',
          mediaUrl: 'https://example.com/image.jpg',
        })
        .expect(201);

      // Wait for notification processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // User1 should have a post creation notification
      const notificationsResponse = await request(app.getHttpServer())
        .get('/notifications/my')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const postNotifications = notificationsResponse.body.filter(
        (notification: any) => notification.type === 'post_created'
      );

      expect(postNotifications.length).toBeGreaterThan(0);
      expect(postNotifications[0]).toHaveProperty('data.authorId', user2Id);
    });
  });
});
```

## 📊 Test Coverage

### Coverage Configuration
```json
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:cov

# View coverage in browser
open coverage/lcov-report/index.html
```

## 🔧 Test Utilities and Helpers

### Test Database Setup
```typescript
// test-utils/database.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const TestDatabaseModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'test'),
    password: configService.get('DB_PASSWORD', 'test'),
    database: configService.get('DB_NAME', 'test_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: true,
  }),
  inject: [ConfigService],
});
```

### Mock Service Factory
```typescript
// test-utils/mock-factory.ts
export class MockFactory {
  static createUser(overrides: Partial<any> = {}) {
    return {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createPost(overrides: Partial<any> = {}) {
    return {
      id: 'post-id',
      userId: 'user-id',
      caption: 'Test post',
      mediaUrl: 'https://example.com/image.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createNotification(overrides: Partial<any> = {}) {
    return {
      id: 'notification-id',
      userId: 'user-id',
      type: 'follow',
      message: 'Someone followed you',
      data: {},
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
```

## 🚀 Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      mongodb:
        image: mongo:4.4
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand(\"ping\").ok'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      rabbitmq:
        image: rabbitmq:3-management
        options: >-
          --health-cmd "rabbitmq-diagnostics ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2

    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test

    - name: Run e2e tests
      run: npm run test:e2e

    - name: Upload coverage
      uses: codecov/codecov-action@v1
      with:
        file: ./coverage/lcov.info
```

## 📋 Testing Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### 2. Mocking Strategy
- Mock external dependencies
- Use realistic mock data
- Avoid over-mocking
- Test edge cases and error scenarios

### 3. Database Testing
- Use test databases or in-memory databases
- Clean up data between tests
- Use transactions for test isolation
- Test database constraints and relationships

### 4. Performance Testing
- Monitor test execution time
- Use test timeouts appropriately
- Optimize slow tests
- Run tests in parallel when possible

### 5. Error Testing
- Test error conditions
- Verify error messages
- Test boundary conditions
- Test invalid input handling

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check if test database is running
docker ps | grep postgres

# Reset test database
docker-compose down
docker-compose up -d postgres
```

#### 2. Port Conflicts
```bash
# Check for port conflicts
netstat -tulpn | grep :3000

# Kill process using port
kill -9 <PID>
```

#### 3. Test Timeouts
```javascript
// Increase timeout for slow tests
jest.setTimeout(30000);
```

#### 4. Coverage Issues
```bash
# Regenerate coverage
rm -rf coverage/
npm run test:cov
```

---

This testing guide provides comprehensive coverage of testing strategies for the Instagram Clone microservices application. For more specific testing scenarios, refer to the individual service test files and the main documentation. 