import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly commonService: CommonService,
  ) {}

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    return user;
  }
}
