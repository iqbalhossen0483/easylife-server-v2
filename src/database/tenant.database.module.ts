import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbListEntity } from 'src/entites/dbList.entity';
import { TenantConnectionManager } from './tenant-connection.manager';
import { TenantDatabaseService } from './tenant-datasource.manager';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DbListEntity])],
  providers: [TenantConnectionManager, TenantDatabaseService],
  exports: [TenantConnectionManager, TenantDatabaseService],
})
export class TenantDatabaseModule {}
