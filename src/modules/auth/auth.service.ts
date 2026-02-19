import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { CommonService } from 'src/common/common.service';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
import { JWT_Payload } from 'src/types/common';
import { FindOptionsWhere } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commonService: CommonService,
    private readonly jwtService: JwtService,
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private generateToken(user: UserEntity, tenantId: number) {
    const token = this.jwtService.sign<JWT_Payload>({
      sub: user.id,
      tenantId: tenantId,
      phone: user.phone,
      designation: user.designation,
    });
    return token;
  }

  private setCookies(res: Response, token: string) {
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

  async login(payload: LoginDto, dbId: number, res: Response) {
    const { password, phone } = payload;

    // 1. Check database exists in master DB
    const database = await this.commonService.getDataDatabase(dbId);

    // 2. Query tenant DB
    const user = await this.getUser({ phone });

    // 3. Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Authentication failed');
    }
    const { password: _, ...rest } = user;

    // 4. Issue JWT with tenant info embedded
    const token = this.generateToken(user, dbId);

    // 5. Set cookie
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

  async getProfile(res: Response, userId: number, tenantId: number) {
    const database = await this.commonService.getDataDatabase(tenantId);

    const user = await this.getUser({ id: userId });
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
