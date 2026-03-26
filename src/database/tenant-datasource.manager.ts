import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entites/customer.entity';
import { DbListEntity } from 'src/entites/dbList.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { SupplierEntity } from 'src/entites/supplier.entity';
import { ExpenseCategoryEntity } from 'src/entites/expense.entity';
import { NotesEntity } from 'src/entites/notes.entity';
import { Target } from 'src/entites/target.entity';
import { UserEntity } from 'src/entites/user.entity';
import { JWT_Payload } from 'src/types/common';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class TenantDatabaseService {
  private tenantDataSources = new Map<string, DataSource>();

  constructor(
    private readonly configService: ConfigService,
    @Inject(REQUEST)
    private readonly request: Request & { tenantId: number; user: JWT_Payload },
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
  ) {}

  private async getDataSource(): Promise<DataSource> {
    const database = await this.dbListRepo.findOne({
      where: { id: this.request.tenantId },
    });

    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }
    const dbName = database.name;

    if (this.tenantDataSources.has(dbName)) {
      return this.tenantDataSources.get(dbName)!;
    }

    const dataSource = new DataSource({
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASS'),
      database: dbName,
      entities: [UserEntity, Target, NotesEntity, ExpenseCategoryEntity, CustomerEntity, ProductEntity, SupplierEntity],
      synchronize: true,
    });

    await dataSource.initialize();
    this.tenantDataSources.set(dbName, dataSource);

    return dataSource;
  }

  async getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const dataSource = await this.getDataSource();
    return dataSource.getRepository<T>(entity);
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
