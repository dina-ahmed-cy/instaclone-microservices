import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PostService } from './post-service.service';

@Controller()
export class PostServiceController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern({ cmd: 'create_post' })
  async createPost(data: { userId: string; caption?: string; mediaUrl: string }) {
    console.log('📝 Post Service Controller: Received create_post request');
    console.log('📝 Post data:', JSON.stringify(data, null, 2));
    const result = await this.postService.createPost(data);
    console.log('📝 Post Service Controller: Post created successfully');
    return result;
  }

  @MessagePattern({ cmd: 'get_posts_for_user' })
  async getPostsForUser({ userId }: { userId: string }) {
    console.log('📝 Post Service Controller: Received get_posts_for_user request for user:', userId);
    return this.postService.getPostsForUser(userId);
  }

  @MessagePattern({ cmd: 'get_feed_for_user' })
  async getFeedForUser({ userId }: { userId: string }) {
    console.log('📝 Post Service Controller: Received get_feed_for_user request for user:', userId);
    return this.postService.getFeedForUser(userId);
  }
}
