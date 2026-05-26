import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { InitUserDto } from './dto/init-user.dto';

@ApiTags('User')
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('dashboard/:cookieToken')
  @ApiOperation({ summary: 'Get user dashboard data' })
  async getDashboard(@Param('cookieToken') cookieToken: string) {
    const dashboard = await this.userService.getDashboard(cookieToken);
    if (!dashboard) {
      throw new NotFoundException('User not found');
    }
    return dashboard;
  }

  @Post('users/init')
  @ApiOperation({ summary: 'Initialize new user with cookie token' })
  async initUser(@Body() body: InitUserDto) {
    return this.userService.initUser(body.cookieToken);
  }
}
