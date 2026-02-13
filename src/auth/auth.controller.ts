import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth, AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body()
    body: Auth,
  ): Promise<any> {
    return this.authService.login({
      email: body.email,
      password: body.password,
    });
  }

  @Get('profile')
  profile(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.authService.profile(token);
  }
}
