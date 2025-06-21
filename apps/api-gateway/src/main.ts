console.log('ENV:', process.env);
console.log('JWT_ACCESS_TOKEN_SECRET:', process.env.JWT_ACCESS_TOKEN_SECRET);
console.log('JWT_REFRESH_TOKEN_SECRET:', process.env.JWT_REFRESH_TOKEN_SECRET);
console.log('TEST_VAR:', process.env.TEST_VAR);
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Instaclone API Gateway')
    .setDescription('The main API gateway for the Instaclone microservices application.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Register AccessTokenGuard globally
  const accessTokenGuard = app.get(AccessTokenGuard);
  app.useGlobalGuards(accessTokenGuard);

  // Setup RabbitMQ microservice for cache invalidation
  const configService = app.get(ConfigService);
  const rabbitUri = configService.get('RABBITMQ_URI') || process.env.RABBITMQ_URI || 'amqp://localhost:5672';
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUri],
      queue: 'gateway_cache_invalidation_queue',
      queueOptions: { durable: true },
    },
  });
  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
