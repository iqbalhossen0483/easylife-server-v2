import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DbListEntity } from 'src/entites/dbList.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
  ) {}

  async getDataDatabase(tenantId: number) {
    const database = await this.dbListRepo.findOne({ where: { id: tenantId } });
    if (!database) {
      throw new UnauthorizedException('No organization found');
    }

    return database;
  }
}
