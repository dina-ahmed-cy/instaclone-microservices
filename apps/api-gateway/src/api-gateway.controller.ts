import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { Public } from './auth/decorators/public.decorator';
import { AccessTokenGuard } from './auth/guards/access-token.guard';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Post('users/follow')
  @UseGuards(AccessTokenGuard)
  async followUser(@Body() body: { userIdToFollow: string }, @Request() req: any) {
    return this.apiGatewayService.followUser(req.user.sub, body.userIdToFollow);
  }

  @Post('users/unfollow')
  @UseGuards(AccessTokenGuard)
  async unfollowUser(@Body() body: { userIdToUnfollow: string }, @Request() req: any) {
    return this.apiGatewayService.unfollowUser(req.user.sub, body.userIdToUnfollow);
  }

  @Get('users/following')
  @UseGuards(AccessTokenGuard)
  async getFollowingList(@Request() req: any) {
    return this.apiGatewayService.getFollowingList(req.user.sub);
  }

  @Get('users/followers')
  @UseGuards(AccessTokenGuard)
  async getFollowersList(@Request() req: any) {
    return this.apiGatewayService.getFollowersList(req.user.sub);
  }
}
