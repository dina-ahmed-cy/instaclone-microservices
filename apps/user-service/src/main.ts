import * as crypto from 'crypto';
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}
import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT, 10) || 3002,
    },
  });
  await app.listen();
}
bootstrap();
