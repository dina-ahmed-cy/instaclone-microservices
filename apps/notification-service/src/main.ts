import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log('🚀 Starting Notification Service (Hybrid Setup)...');
  const app = await NestFactory.create(NotificationModule);

  // Connect to RabbitMQ for event handling
  console.log('🔗 Connecting to RabbitMQ...');
  console.log('📡 RabbitMQ URI:', process.env.RABBITMQ_URI || 'amqp://rabbitmq:5672');
  console.log('📡 Queue name: notifications_exchange');
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://rabbitmq:5672'],
      queue: 'notifications_exchange',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Connect to TCP for direct calls
  console.log('🔗 Connecting to TCP on port 3004...');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3004,
    },
  });

  console.log('🚀 Starting all microservices...');
  await app.startAllMicroservices();
  console.log('✅ Notification service is listening on port 3004');
  console.log('✅ RabbitMQ microservice is ready for events');
  console.log('✅ TCP microservice is ready for direct calls');
}

bootstrap();
