import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { DbListEntity } from 'src/entites/dbList.entity';
import { UserEntity } from 'src/entites/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
    private readonly jwtService: JwtService,
    private readonly tenantDatabaseService: TenantDatabaseService,
  ) {}

  async login(payload: LoginDto, dbId: number) {
    const { password, phone } = payload;

    // 1. Check database exists in master DB
    const database = await this.dbListRepo.findOne({ where: { id: dbId } });
    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }

    // 3. Query tenant DB
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { phone } });

    // 4. Issue JWT with tenant info embedded
    const token = this.jwtService.sign({
      sub: phone,
    });

    return { token, user, database };
  }
}
