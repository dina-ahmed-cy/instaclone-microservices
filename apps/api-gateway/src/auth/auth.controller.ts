import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { lastValueFrom } from 'rxjs';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @HttpCode(201)
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered. Returns the new user object.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Input data is invalid.' })
  @ApiResponse({ status: 409, description: 'Conflict. Email already exists.' })
  async register(@Body() body: RegisterDto) {
    // Optional: Log registration attempt
    console.log(`Register endpoint called for email: ${body.email}`);
    try {
      const result = await lastValueFrom(
        this.authClient.send({ cmd: 'register' }, body),
      );
      return result;
    } catch (error) {
      // Handle known conflict (e.g., email already exists)
      if (
        error?.message?.toLowerCase().includes('email') &&
        error?.message?.toLowerCase().includes('exist')
      ) {
        throw new ConflictException('Email already in use.');
      }
      throw new InternalServerErrorException('Registration failed.');
    }
  }

  @Post('login')
  @HttpCode(200)
  @Public()
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns an access token and a refresh token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid credentials.' })
  async login(@Body() body: LoginDto) {
    try {
      const result = await lastValueFrom(
        this.authClient.send({ cmd: 'login' }, body),
      );
      return result;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @Public()
  @ApiOperation({ summary: 'Obtain a new access token using a refresh token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token refreshed successfully. Returns a new token pair.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Refresh token is invalid or expired.' })
  async refreshToken(@Req() req: Request) {
    // req.user contains the payload + refreshToken from the strategy
    const user = req.user;
    const result = await lastValueFrom(
      this.authClient.send({ cmd: 'refresh_token' }, user),
    );
    return result;
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Access token is required.' })
  async logout(@Req() req: Request) {
    // req.user.sub contains the userId
    const userId = (req.user as any).sub;
    const result = await lastValueFrom(
      this.authClient.send({ cmd: 'logout' }, { userId }),
    );
    return result;
  }
} 