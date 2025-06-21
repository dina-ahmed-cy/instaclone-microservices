import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FeedCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.sub) {
      return undefined;
    }
    // Use a base key for the feed, plus the userId
    return `feed:${user.sub}`;
  }
} 