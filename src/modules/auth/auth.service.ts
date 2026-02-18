import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { DbListEntity } from 'src/entites/dbList.entity';
import { UserEntity } from 'src/entites/user.entity';
import { JWT_Payload } from 'src/types/common';
import { Repository } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
    private readonly jwtService: JwtService,
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async login(payload: LoginDto, dbId: number, res: Response) {
    const { password, phone } = payload;

    // 1. Check database exists in master DB
    const database = await this.dbListRepo.findOne({ where: { id: dbId } });
    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }

    // 3. Query tenant DB
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { phone } });

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Authentication failed');
    }

    // 4. Issue JWT with tenant info embedded
    const token = this.jwtService.sign<JWT_Payload>({
      sub: user.id,
      tenantId: database.id,
      phone: user.phone,
      designation: user.designation,
    });

    const { password: _, ...rest } = user;

    res.cookie('token', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

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
