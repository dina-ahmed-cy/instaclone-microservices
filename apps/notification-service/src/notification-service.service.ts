import { Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Notification, NotificationDocument } from './schemas/notification.schema';

interface NotificationData {
  userId: string;
  caption: string;
  mediaUrl?: string;
  postId?: string;
}

@Injectable()
export class NotificationServiceService {
  private userServiceClient: ClientProxy;

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>
  ) {
    console.log('🔧 NotificationServiceService constructor called');
    console.log('🔧 Event handlers should be registered now');
    
    this.userServiceClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'user-service',
        port: 3002,
      },
    });
  }

  // Service methods called by the controller event handlers
  async handlePostCreated(data: NotificationData) {
    console.log('📢 Notification Service: Processing post_created event', data);
    
    try {
      // Get the user's followers
      const followers = await this.getUserFollowers(data.userId);
      
      // Create notifications for all followers
      const notifications = followers.map(followerId => ({
        userId: followerId,
        type: 'post_created' as const,
        message: `@${data.userId} just posted: ${data.caption.substring(0, 50)}${data.caption.length > 50 ? '...' : ''}`,
        data: {
          postId: data.postId,
          authorId: data.userId,
          caption: data.caption,
          mediaUrl: data.mediaUrl
        },
        read: false
      }));

      // Save notifications to database
      if (notifications.length > 0) {
        await this.notificationModel.insertMany(notifications);
        console.log(`📢 Sent notifications to ${notifications.length} followers`);
      }

      // Simulate real-time notification (in a real app, you'd use WebSockets)
      this.simulateRealTimeNotification(notifications);
      
    } catch (error) {
      console.error('❌ Error processing post_created notification:', error);
    }
  }

  async handleUserFollowed(data: { followerId: string; followedId: string }) {
    console.log('📢 Notification Service: Processing user_followed event', data);
    
    try {
      const notification = {
        userId: data.followedId,
        type: 'follow' as const,
        message: `@${data.followerId} started following you`,
        data: {
          followerId: data.followerId
        },
        read: false
      };

      await this.notificationModel.create(notification);
      console.log(`📢 Sent follow notification to user ${data.followedId}`);
      
      // Simulate real-time notification
      this.simulateRealTimeNotification([notification]);
      
    } catch (error) {
      console.error('❌ Error processing user_followed notification:', error);
    }
  }

  async getUserFollowers(userId: string): Promise<string[]> {
    try {
      const response = await this.userServiceClient.send({ cmd: 'get_user_followers' }, { userId }).toPromise();
      return response?.followers || [];
    } catch (error) {
      console.error('❌ Error fetching user followers:', error);
      return [];
    }
  }

  @MessagePattern('get_user_notifications')
  async getUserNotifications(data: { userId: string }): Promise<any[]> {
    try {
      console.log('🔍 Notification Service: Getting notifications for user:', data.userId);
      
      const notifications = await this.notificationModel
        .find({ userId: data.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();
      
      console.log('🔍 Notification Service: Found', notifications.length, 'notifications for user:', data.userId);
      console.log('🔍 Notification Service: Notifications:', JSON.stringify(notifications, null, 2));
      
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching user notifications:', error);
      return [];
    }
  }

  @MessagePattern('mark_notification_as_read')
  async markNotificationAsRead(data: { notificationId: string }): Promise<void> {
    try {
      await this.notificationModel.findByIdAndUpdate(data.notificationId, { read: true });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  @MessagePattern('mark_all_notifications_as_read')
  async markAllNotificationsAsRead(data: { userId: string }): Promise<void> {
    try {
      await this.notificationModel.updateMany(
        { userId: data.userId, read: false },
        { read: true }
      );
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }

  private simulateRealTimeNotification(notifications: any[]): void {
    notifications.forEach(notification => {
      console.log(`🔔 REAL-TIME NOTIFICATION for user ${notification.userId}:`);
      console.log(`   📝 ${notification.message}`);
      console.log(`   📅 ${new Date().toISOString()}`);
      console.log(`   📊 Type: ${notification.type}`);
      console.log(`   ──────────────────────────────────────────`);
    });
  }

  // HTTP endpoint methods
  async testNotification(data: NotificationData): Promise<any> {
    console.log('🧪 Testing notification via HTTP endpoint:', data);
    
    // Simulate the post_created event
    await this.handlePostCreated(data);
    
    return {
      success: true,
      message: 'Test notification processed successfully',
      data
    };
  }

  async getHealth(): Promise<any> {
    return {
      status: 'healthy',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
