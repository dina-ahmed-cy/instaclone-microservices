import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Get()
  getHello(): string {
    return this.authServiceService.getHello();
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: any) {
    console.log('Auth service received register command:', data);
    return this.authServiceService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: any) {
    console.log('Auth service received login command:', data);
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(@Payload() data: any) {
    console.log('Auth service received refresh token command:', data);
    return this.authServiceService.refreshToken(data);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Payload() data: any) {
    console.log('Auth service received logout command:', data);
    return this.authServiceService.logout(data);
  }
}
