import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerEntity } from 'src/entites/customer.entity';
import {
  ExpenseCategoryEntity,
  ExpenseEntity,
} from 'src/entites/expense.entity';
import { NotesEntity } from 'src/entites/notes.entity';
import {
  CollectionEntity,
  OrderEntity,
  OrderProductEntity,
} from 'src/entites/order.entity';
import { PendingCommissionEntity } from 'src/entites/pending_commission.entity';
import { ProductEntity } from 'src/entites/product.entity';
import {
  ProductionEntity,
  ProductionProductEntity,
} from 'src/entites/production.entity';
import {
  PurchaseCollectionEntity,
  PurchaseEntity,
  PurchaseProductEntity,
} from 'src/entites/purchase.entity';
import {
  DailyCashReportEntity,
  DailyStockReportEntity,
  MonthlyCashReportEntity,
  MonthlyStockReportEntity,
  YearlyCashReportEntity,
  YearlyStockReportEntity,
} from 'src/entites/report.entity';
import { SupplierEntity } from 'src/entites/supplier.entity';
import { Target } from 'src/entites/target.entity';
import {
  PendingBalanceTransferEntity,
  TransactionEntity,
} from 'src/entites/transaction.entity';
import { UserEntity } from 'src/entites/user.entity';
import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
} from 'typeorm';

export const TENANT_ENTITIES = [
  UserEntity,
  Target,
  NotesEntity,
  ExpenseCategoryEntity,
  ExpenseEntity,
  CustomerEntity,
  ProductEntity,
  SupplierEntity,
  OrderEntity,
  OrderProductEntity,
  CollectionEntity,
  PurchaseEntity,
  PurchaseProductEntity,
  PurchaseCollectionEntity,
  ProductionEntity,
  ProductionProductEntity,
  PendingCommissionEntity,
  TransactionEntity,
  PendingBalanceTransferEntity,
  DailyCashReportEntity,
  MonthlyCashReportEntity,
  YearlyCashReportEntity,
  DailyStockReportEntity,
  MonthlyStockReportEntity,
  YearlyStockReportEntity,
];

@Injectable()
export class TenantConnectionManager implements OnModuleDestroy {
  private dataSources = new Map<string, DataSource>();
  private initLocks = new Map<string, Promise<DataSource>>();

  constructor(private readonly configService: ConfigService) {}

  async getDataSource(dbName: string): Promise<DataSource> {
    // Return cached if initialized
    const cached = this.dataSources.get(dbName);
    if (cached?.isInitialized) return cached;

    // Prevent duplicate initialization (race condition guard)
    const existingLock = this.initLocks.get(dbName);
    if (existingLock) return existingLock;

    const initPromise = this.createDataSource(dbName);
    this.initLocks.set(dbName, initPromise);

    try {
      const ds = await initPromise;
      return ds;
    } finally {
      this.initLocks.delete(dbName);
    }
  }

  private async createDataSource(dbName: string): Promise<DataSource> {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    const dataSource = new DataSource({
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASS'),
      database: dbName,
      entities: TENANT_ENTITIES,
      synchronize: !isProd,
      extra: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
      },
    });

    await dataSource.initialize();
    this.dataSources.set(dbName, dataSource);
    return dataSource;
  }

  async getRepository<T extends ObjectLiteral>(
    dbName: string,
    entity: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const ds = await this.getDataSource(dbName);
    return ds.getRepository<T>(entity);
  }

  async createQueryRunner(dbName: string): Promise<QueryRunner> {
    const ds = await this.getDataSource(dbName);
    return ds.createQueryRunner();
  }

  async onModuleDestroy() {
    const closePromises: Promise<void>[] = [];
    for (const [, ds] of this.dataSources) {
      if (ds.isInitialized) {
        closePromises.push(ds.destroy());
      }
    }
    await Promise.allSettled(closePromises);
    this.dataSources.clear();
  }
}
