import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async createPost(data: { userId: string; caption?: string; mediaUrl: string }) {
    const post = new this.postModel(data);
    const newPost = await post.save();
    
    console.log('=== POST CREATED ===');
    console.log('Post data:', JSON.stringify(newPost, null, 2));
    console.log('Emitting post_created event...');
    
    try {
      this.notificationClient.emit('post_created', newPost);
      console.log('post_created event emitted successfully');
    } catch (error) {
      console.error('Failed to emit post_created event', error);
    }
    
    console.log('=== END POST CREATED ===');
    return newPost;
  }

  async getPostsForUser(userId: string) {
    return this.postModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getFeedForUser(userId: string) {
    try {
      // Get the user's following list
      const followingList = await lastValueFrom(
        this.userClient.send({ cmd: 'get_following_list' }, { userId })
      );
      
      // Extract user IDs from the following list
      const followingIds = followingList.map((user: any) => user.id);
      
      // Add the current user's ID to include their own posts
      const allUserIds = [userId, ...followingIds];
      
      // Get posts from all these users, sorted by creation date (newest first)
      const posts = await this.postModel
        .find({ userId: { $in: allUserIds } })
        .sort({ createdAt: -1 })
        .exec();
      
      return posts;
    } catch (error) {
      console.error('Error getting feed for user:', error);
      throw error;
    }
  }
}
