// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { getTenantDataSource } from 'src/database/tenant-datasource.manager';
import { DbListEntity } from 'src/entites/dbList.entity';
import { Designation, UserEntity } from 'src/entites/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(db: string) {
    const database = await this.dbListRepo.findOne({ where: { name: db } });
    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }

    const tenantDataSource = await getTenantDataSource(
      database.name,
      this.configService,
    );

    const userRepo = tenantDataSource.getRepository(UserEntity);
    const user = userRepo.create({
      name: 'Test User',
      address: 'Test Address',
      designation: Designation.ADMIN,
      phone: '1234567890',
      password: '123456',
    });

    await userRepo.save(user);
    return user;
  }

  async login(payload: LoginDto) {
    const { db, password, phone } = payload;

    // 1. Check database exists in master DB
    const database = await this.dbListRepo.findOne({ where: { id: db } });
    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }

    // 2. Connect to tenant DB
    const tenantDataSource = await getTenantDataSource(
      database.name,
      this.configService,
    );

    // 3. Query tenant DB
    const userRepo = tenantDataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { phone } });

    // 4. Issue JWT with tenant info embedded
    const token = this.jwtService.sign({
      sub: phone,
    });

    return { token, user, database };
  }
}
