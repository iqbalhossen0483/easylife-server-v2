import { DbListEntity } from '@/entites/dbList.entity';
import { JWT_Payload } from '@/types/common';
import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityTarget, ObjectLiteral, QueryRunner, Repository } from 'typeorm';
import { TenantConnectionManager } from './tenant-connection.manager';

@Injectable({ scope: Scope.REQUEST })
export class TenantDatabaseService {
  private cachedDbName: string | null = null;

  constructor(
    private readonly connectionManager: TenantConnectionManager,
    @Inject(REQUEST)
    private readonly request: Request & { tenantId: number; user: JWT_Payload },
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
  ) {}

  private async getDbName(): Promise<string> {
    if (this.cachedDbName) return this.cachedDbName;

    const database = await this.dbListRepo.findOne({
      where: { id: this.request.tenantId },
    });

    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }

    this.cachedDbName = database.name;
    return database.name;
  }

  async getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const dbName = await this.getDbName();
    return this.connectionManager.getRepository(dbName, entity);
  }

  async createQueryRunner(): Promise<QueryRunner> {
    const dbName = await this.getDbName();
    return this.connectionManager.createQueryRunner(dbName);
  }

  async getDataDatabase() {
    const database = await this.dbListRepo.findOne({
      where: { id: this.request.tenantId },
    });
    if (!database) {
      throw new UnauthorizedException('No organization found');
    }
    return database;
  }

  getTenantId() {
    return this.request.tenantId;
  }

  getCurrentUserId() {
    return this.request.user?.sub;
  }

  async updateTenantCount(
    field: 'current_user' | 'current_product' | 'current_customer',
    increment: boolean,
  ) {
    const tenantId = this.getTenantId();
    if (increment) {
      await this.dbListRepo.increment({ id: tenantId }, field, 1);
    } else {
      await this.dbListRepo.decrement({ id: tenantId }, field, 1);
    }
  }

  async updateTenantInfo(data: Partial<DbListEntity>) {
    const tenantId = this.getTenantId();
    await this.dbListRepo.update({ id: tenantId }, data);
    return this.dbListRepo.findOne({ where: { id: tenantId } });
  }
}
