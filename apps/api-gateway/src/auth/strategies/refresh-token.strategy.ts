import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    console.log('JWT_REFRESH_TOKEN_SECRET:', configService.get('JWT_REFRESH_TOKEN_SECRET'));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // Extract the refresh token from the Authorization header
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader?.replace('Bearer ', '').trim();
    return { ...payload, refreshToken };
  }
} 