import { Controller, Get, Post, Param, UseGuards, Request, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private notificationServiceClient: ClientProxy
  ) {}

  @Get('my')
  async getMyNotifications(@Request() req: any) {
    const userId = (req.user as any).sub;
    console.log('🔔 API Gateway: Getting notifications for user:', userId);
    
    const result = await this.notificationServiceClient.send('get_user_notifications', { userId }).toPromise();
    console.log('🔔 API Gateway: Notification service response:', result);
    
    return result;
  }

  @Post(':notificationId/read')
  async markNotificationAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationServiceClient.send('mark_notification_as_read', { notificationId }).toPromise();
  }

  @Post('read-all')
  async markAllNotificationsAsRead(@Request() req: any) {
    const userId = (req.user as any).sub;
    return this.notificationServiceClient.send('mark_all_notifications_as_read', { userId }).toPromise();
  }
} 