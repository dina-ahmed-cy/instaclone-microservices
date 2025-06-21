import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserServiceController {
  constructor(private readonly userService: UserServiceService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(data: { email: string; passwordHash: string }) {
    try {
      return await this.userService.createUser(data);
    } catch (error) {
      // Unique constraint violation (duplicate email)
      if (error.code === '23505') {
        throw new RpcException('User with this email already exists.');
      }
      throw new RpcException('Internal server error.');
    }
  }

  @MessagePattern({ cmd: 'get_user_by_email' })
  async getUserByEmail(data: { email: string }) {
    const user = await this.userService.getUserByEmail(data.email);
    if (!user) {
      throw new RpcException('User not found.');
    }
    return user;
  }

  @MessagePattern({ cmd: 'follow_user' })
  async followUser(data: { followerId: string; followingId: string }) {
    try {
      return await this.userService.followUser(data.followerId, data.followingId);
    } catch (error) {
      throw new RpcException(error.message || 'Internal server error.');
    }
  }

  @MessagePattern({ cmd: 'unfollow_user' })
  async unfollowUser(data: { followerId: string; followingId: string }) {
    try {
      return await this.userService.unfollowUser(data.followerId, data.followingId);
    } catch (error) {
      throw new RpcException(error.message || 'Internal server error.');
    }
  }

  @MessagePattern({ cmd: 'get_following_list' })
  async getFollowingList(data: { userId: string }) {
    try {
      return await this.userService.getFollowingList(data.userId);
    } catch (error) {
      throw new RpcException(error.message || 'Internal server error.');
    }
  }

  @MessagePattern({ cmd: 'get_followers_list' })
  async getFollowersList(data: { userId: string }) {
    try {
      return await this.userService.getFollowersList(data.userId);
    } catch (error) {
      throw new RpcException(error.message || 'Internal server error.');
    }
  }

  @MessagePattern({ cmd: 'get_user_followers' })
  async getUserFollowers(data: { userId: string }) {
    try {
      return await this.userService.getUserFollowers(data.userId);
    } catch (error) {
      throw new RpcException(error.message || 'Internal server error.');
    }
  }
}
