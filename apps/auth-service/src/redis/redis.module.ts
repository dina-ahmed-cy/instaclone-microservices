import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: Number(configService.get('REDIS_PORT')),
          },
          password: configService.get('REDIS_PASSWORD') || undefined,
        });
        client.on('error', (err) => {
          console.error('Redis Client Error', err);
        });
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {} 