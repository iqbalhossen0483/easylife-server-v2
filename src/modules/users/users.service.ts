import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { DbListEntity } from 'src/entites/dbList.entity';
import { UserEntity } from 'src/entites/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly tenantDatabaseService: TenantDatabaseService,
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
  ) {}

  private async getDataDatabase(tenantId: number) {
    const database = await this.dbListRepo.findOne({ where: { id: tenantId } });
    if (!database) {
      throw new UnauthorizedException('No organization found');
    }

    return database;
  }

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    if (!user) {
      throw new UnauthorizedException('No user found');
    }

    return user;
  }
}
