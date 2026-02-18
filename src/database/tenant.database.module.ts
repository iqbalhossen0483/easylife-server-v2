import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbListEntity } from 'src/entites/dbList.entity';
import { TenantDatabaseService } from './tenant-datasource.manager';

@Module({
  imports: [TypeOrmModule.forFeature([DbListEntity])],
  providers: [TenantDatabaseService],
  exports: [TenantDatabaseService],
})
export class TenantDatabaseModule {}
