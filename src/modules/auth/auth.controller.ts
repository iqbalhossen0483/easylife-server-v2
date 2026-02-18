import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() payload: LoginDto, @Req() req: Request) {
    return this.authService.login(payload, req.tenantId);
  }
}
