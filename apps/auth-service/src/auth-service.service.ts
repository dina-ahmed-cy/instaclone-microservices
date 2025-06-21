import { Injectable, Inject, OnModuleInit, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RedisClientType } from 'redis';
import * as bcrypt from 'bcrypt';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

function parseExpirationToSeconds(exp: string): number {
  // Supports '7d', '900s', '1h', etc.
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid expiration format');
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: throw new Error('Invalid expiration unit');
  }
}

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    try {
      console.log('Checking Redis connection...');
      const pong = await this.redisClient.ping();
      if (pong === 'PONG') {
        console.log('Redis connection established successfully.');
      } else {
        console.error('Unexpected Redis PING response:', pong);
      }
    } catch (err) {
      console.error('Failed to establish Redis connection.', err);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  // Password hashing
  private async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new InternalServerErrorException('Error processing password.');
    }
  }

  // Password comparison
  private async comparePasswords(password: string, storedPasswordHash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, storedPasswordHash);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new InternalServerErrorException('Error processing password.');
    }
  }

  // Generate access and refresh tokens
  private async generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });
    return { accessToken, refreshToken };
  }

  // Store refresh token in Redis
  private async updateRefreshTokenInRedis(userId: string, refreshToken: string): Promise<void> {
    const key = `session:${userId}`;
    const exp = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
    const ttl = parseExpirationToSeconds(exp);
    await this.redisClient.set(key, refreshToken, { EX: ttl });
  }

  // Registration logic
  public async register(dto: RegisterDto) {
    try {
      const passwordHash = await this.hashPassword(dto.password);
      const payload = { email: dto.email, passwordHash };
      const user = await lastValueFrom(
        this.userClient.send({ cmd: 'create_user' }, payload)
      );
      
      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      // Generate tokens for the new user
      const tokens = await this.generateTokens(userWithoutPassword);
      await this.updateRefreshTokenInRedis(user.id, tokens.refreshToken);
      
      return {
        user: userWithoutPassword,
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  // Login logic
  public async login(dto: LoginDto) {
    try {
      const user = await lastValueFrom(
        this.userClient.send({ cmd: 'get_user_by_email' }, { email: dto.email })
      );
      const passwordsMatch = await this.comparePasswords(dto.password, user.passwordHash);
      if (!passwordsMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // Remove passwordHash before returning
      delete user.passwordHash;
      const tokens = await this.generateTokens(user);
      await this.updateRefreshTokenInRedis(user.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // Refresh token logic
  public async refreshToken(user: { sub: string; email: string; refreshToken: string }) {
    const userId = user.sub;
    const key = `session:${userId}`;
    const storedToken = await this.redisClient.get(key);
    if (!storedToken || storedToken !== user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }
    const newTokens = await this.generateTokens({ id: userId, email: user.email });
    await this.updateRefreshTokenInRedis(userId, newTokens.refreshToken);
    return newTokens;
  }

  // Logout logic
  public async logout(userId: string) {
    try {
      const key = `session:${userId}`;
      await this.redisClient.del(key);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new InternalServerErrorException('An error occurred during logout. Please try again.');
    }
  }
}
