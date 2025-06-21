import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async followUser(followerId: string, followingId: string) {
    return lastValueFrom(
      this.userClient.send({ cmd: 'follow_user' }, { followerId, followingId })
    );
  }

  async unfollowUser(followerId: string, followingId: string) {
    return lastValueFrom(
      this.userClient.send({ cmd: 'unfollow_user' }, { followerId, followingId })
    );
  }

  async getFollowingList(userId: string) {
    return lastValueFrom(
      this.userClient.send({ cmd: 'get_following_list' }, { userId })
    );
  }

  async getFollowersList(userId: string) {
    return lastValueFrom(
      this.userClient.send({ cmd: 'get_followers_list' }, { userId })
    );
  }
}
