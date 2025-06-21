import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { NotificationServiceService } from './notification-service.service';

interface NotificationResponse {
  _id: string;
  userId: string;
  type: string;
  message: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
}

interface NotificationData {
  userId: string;
  caption: string;
  mediaUrl?: string;
  postId?: string;
}

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationServiceService: NotificationServiceService) {}

  @Get('health')
  getHealth() {
    return this.notificationServiceService.getHealth();
  }

  @Post('test-notification')
  testNotification(@Body() data: any) {
    return this.notificationServiceService.testNotification(data);
  }

  @Get('notifications/:userId')
  getUserNotifications(@Param('userId') userId: string): Promise<any[]> {
    return this.notificationServiceService.getUserNotifications({ userId });
  }

  @Post('notifications/:notificationId/read')
  markNotificationAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationServiceService.markNotificationAsRead({ notificationId });
  }

  @Post('notifications/:userId/read-all')
  markAllNotificationsAsRead(@Param('userId') userId: string) {
    return this.notificationServiceService.markAllNotificationsAsRead({ userId });
  }

  @MessagePattern('get_user_notifications')
  async getUserNotificationsTCP(data: { userId: string }) {
    return this.notificationServiceService.getUserNotifications(data);
  }

  @MessagePattern('mark_notification_as_read')
  async markNotificationAsReadTCP(data: { notificationId: string }) {
    return this.notificationServiceService.markNotificationAsRead(data);
  }

  @MessagePattern('mark_all_notifications_as_read')
  async markAllNotificationsAsReadTCP(data: { userId: string }) {
    return this.notificationServiceService.markAllNotificationsAsRead(data);
  }

  @EventPattern('post_created')
  async handlePostCreated(@Payload() data: NotificationData) {
    console.log('📢 Notification Controller: Received post_created event', data);
    console.log('📢 Event handler: handlePostCreated is working!');
    return this.notificationServiceService.handlePostCreated(data);
  }

  @EventPattern('user_followed')
  async handleUserFollowed(@Payload() data: { followerId: string; followedId: string }) {
    console.log('📢 Notification Controller: Received user_followed event', data);
    console.log('📢 Event handler: handleUserFollowed is working!');
    return this.notificationServiceService.handleUserFollowed(data);
  }

  @EventPattern('test_event')
  async handleTestEvent(@Payload() data: any) {
    console.log('🧪 Test event received:', data);
    console.log('🧪 Test event handler is working!');
  }
}
