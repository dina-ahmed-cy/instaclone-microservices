import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_followers' })
export class UserFollower {
  @PrimaryColumn()
  followerId: string;

  @PrimaryColumn()
  followingId: string;

  @ManyToOne(() => User, user => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;
} 