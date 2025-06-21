import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.NOTIFICATION_DB_URI || 'mongodb://localhost:27017/notification-service'),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationModule {} 