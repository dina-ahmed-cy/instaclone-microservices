import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserFollower } from './entities/user-follower.entity';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB PASSWORD:', configService.get('USER_DB_PASSWORD'));
        return {
          type: 'postgres',
          host: configService.get('USER_DB_HOST'),
          port: parseInt(configService.get('USER_DB_PORT'), 10),
          username: configService.get('USER_DB_USERNAME'),
          password: configService.get('USER_DB_PASSWORD'),
          database: configService.get('USER_DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([User, UserFollower]),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
