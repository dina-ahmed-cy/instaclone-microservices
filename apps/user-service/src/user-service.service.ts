import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserFollower } from './entities/user-follower.entity';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

interface CreateUserDto {
  email: string;
  passwordHash: string;
}

@Injectable()
export class UserServiceService {
  private notificationServiceClient: ClientProxy;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFollower)
    private readonly userFollowerRepository: Repository<UserFollower>
  ) {
    this.notificationServiceClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URI || 'amqp://rabbitmq:5672'],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Users cannot follow themselves.');
    }
    const [follower, following] = await Promise.all([
      this.userRepository.findOne({ where: { id: followerId } }),
      this.userRepository.findOne({ where: { id: followingId } }),
    ]);
    if (!follower || !following) {
      throw new Error('User not found.');
    }
    const existing = await this.userFollowerRepository.findOne({ where: { followerId, followingId } });
    if (existing) {
      throw new Error('You are already following this user.');
    }
    const follow = this.userFollowerRepository.create({ followerId, followingId });
    await this.userFollowerRepository.save(follow);
    
    // Emit follow event to notification service via RabbitMQ
    try {
      await this.notificationServiceClient.emit('user_followed', {
        followerId,
        followedId: followingId
      }).toPromise();
      console.log(`📢 Emitted user_followed event: ${followerId} -> ${followingId}`);
    } catch (error) {
      console.error('❌ Error emitting user_followed event:', error);
    }
    
    return { success: true, message: 'User followed successfully.' };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const existing = await this.userFollowerRepository.findOne({ where: { followerId, followingId } });
    if (!existing) {
      throw new Error('You are not following this user.');
    }
    await this.userFollowerRepository.delete({ followerId, followingId });
    
    // Log for notification service (in a real app, you'd emit an event)
    console.log(`📢 User ${followerId} unfollowed user ${followingId}`);
    
    return { success: true, message: 'User unfollowed successfully.' };
  }

  async getFollowingList(userId: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }, 
      relations: ['following', 'following.following'] 
    });
    if (!user) {
      throw new Error('User not found.');
    }
    return user.following.map(follow => ({
      id: follow.following.id,
      email: follow.following.email,
      createdAt: follow.following.createdAt,
      updatedAt: follow.following.updatedAt
    }));
  }

  async getFollowersList(userId: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }, 
      relations: ['followers', 'followers.follower'] 
    });
    if (!user) {
      throw new Error('User not found.');
    }
    return user.followers.map(follow => ({
      id: follow.follower.id,
      email: follow.follower.email,
      createdAt: follow.follower.createdAt,
      updatedAt: follow.follower.updatedAt
    }));
  }

  async getUserFollowers(userId: string) {
    const followers = await this.userFollowerRepository.find({
      where: { followingId: userId },
      relations: ['follower']
    });
    
    return {
      followers: followers.map(f => f.follower.id)
    };
  }
}
