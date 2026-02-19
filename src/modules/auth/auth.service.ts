import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
import { JWT_Payload } from 'src/types/common';
import { FindOptionsWhere } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(user: UserEntity, tenantId: number) {
    const token = this.jwtService.sign<JWT_Payload>({
      sub: user.id,
      tenantId: tenantId,
      phone: user.phone,
      designation: user.designation,
    });
    return token;
  }

  setCookies(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }

  async login(payload: LoginDto, res: Response) {
    const { password, phone } = payload;

    const database = await this.tenantDatabaseService.getDataDatabase();
    const tenantId = this.tenantDatabaseService.getTenantId();

    const user = await this.getUser({ phone });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Authentication failed');
    }
    const { password: _, ...rest } = user;

    const token = this.generateToken(user, tenantId);

    this.setCookies(res, token);

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: rest,
        database,
      },
    };
  }

  logout(res: Response) {
    res.clearCookie('token');
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async getProfile(res: Response) {
    const database = await this.tenantDatabaseService.getDataDatabase();
    const tenantId = this.tenantDatabaseService.getTenantId();
    const currentUserId = this.tenantDatabaseService.getCurrentUserId();

    const user = await this.getUser({ id: currentUserId });
    const { password: _, ...rest } = user;

    const token = this.generateToken(user, tenantId);

    //set cookie
    this.setCookies(res, token);

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: rest,
        database,
      },
    };
  }
}
