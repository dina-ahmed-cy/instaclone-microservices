import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: process.env.AUTH_SERVICE_TCP_PORT || 3001,
    },
  });
  
  await app.listen();
  console.log('Auth Service is listening on port:', process.env.AUTH_SERVICE_TCP_PORT || 3001);
}
bootstrap();
