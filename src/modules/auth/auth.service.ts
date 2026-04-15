import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { UserEntity } from '@/entites/user.entity';
import { RedisService } from '@/services/redis.service';
import { JWT_Payload } from '@/types/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  generateToken(user: UserEntity, tenantId: number) {
    const token = this.jwtService.sign<JWT_Payload>({
      sub: user.id,
      tenantId: tenantId,
      phone: user.phone,
      designation: user.designation,
      jti: Date.now(),
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

  async logout(res: Response, token: string) {
    const decode = this.jwtService.decode<JWT_Payload>(token);
    if (decode.exp) {
      const key = `blacklist:${decode.jti}`;
      const now = Math.floor(Date.now() / 1000);
      const remaingTime = decode.exp - now;
      await this.redisService.set(key, '1', remaingTime);
    }

    // clear cookie
    res.clearCookie('token');
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async getProfile(res: Response, currentToken: string) {
    const database = await this.tenantDatabaseService.getDataDatabase();
    const tenantId = this.tenantDatabaseService.getTenantId();
    const currentUserId = this.tenantDatabaseService.getCurrentUserId();

    // check if token is valid
    const decode = this.jwtService.decode<JWT_Payload>(currentToken);
    if (!decode || !decode.exp || decode.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Authentication failed');
    }
    const key = `blacklist:${decode.jti}`;
    const blacklist = await this.redisService.get(key);
    if (blacklist) {
      throw new UnauthorizedException('Authentication failed');
    }

    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: currentUserId },
      relations: { created_by: true, targets: true, notes: true },
      select: {
        created_by: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

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
