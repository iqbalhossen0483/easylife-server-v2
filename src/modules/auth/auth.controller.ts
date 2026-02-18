import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() payload: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(payload, req.tenantId, res);
  }

  @UseGuards(AuthGaurd)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(AuthGaurd)
  @Get('get-profile')
  getProfile(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.getProfile(res, req.user.sub, req.tenantId);
  }
}
