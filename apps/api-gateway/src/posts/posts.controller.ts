import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreatePostDto } from './dto/create-post.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FeedCacheInterceptor } from './interceptors/feed-cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';
import { EventPattern, Payload } from '@nestjs/microservices';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    @Inject('POST_SERVICE')
    private readonly postClient: ClientProxy,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: any,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid input data.' })
  @HttpCode(201)
  async createPost(@Req() req: Request, @Body() body: CreatePostDto) {
    console.log('=== API GATEWAY: CREATE POST ===');
    console.log('User ID:', (req.user as any).sub);
    console.log('Body:', JSON.stringify(body, null, 2));
    
    const userId = (req.user as any).sub;
    const payload = { userId, ...body };
    
    console.log('Sending to post service:', JSON.stringify(payload, null, 2));
    
    const result = await lastValueFrom(
      this.postClient.send({ cmd: 'create_post' }, payload),
    );
    
    console.log('Post service response:', JSON.stringify(result, null, 2));
    console.log('=== END CREATE POST ===');
    
    return result;
  }

  @Get('/feed')
  @UseInterceptors(FeedCacheInterceptor)
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get the personal post feed for the logged-in user" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Successfully retrieved the user's posts. Returns an array of post objects." })
  @ApiResponse({ status: 401, description: 'Unauthorized. A valid access token is required.' })
  async getFeed(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const result = await lastValueFrom(
      this.postClient.send({ cmd: 'get_feed_for_user' }, { userId }),
    );
    return result;
  }

  @EventPattern('post_created')
  async handlePostCreated(@Payload() data: any) {
    console.log('Received post_created event, payload:', data);
    const userId = data.userId;
    if (!userId) {
      console.error('Cannot invalidate cache: userId is missing from post_created event payload.');
      return;
    }
    const cacheKey = `feed:${userId}`;
    console.log(`Invalidating cache key: ${cacheKey}`);
    try {
      await this.cacheManager.del(cacheKey);
      console.log(`Cache invalidated for key: ${cacheKey}`);
    } catch (error) {
      console.error(`Failed to invalidate cache for key: ${cacheKey}`, error);
    }
  }
} 