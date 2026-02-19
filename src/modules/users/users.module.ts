import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { TenantDatabaseModule } from 'src/database/tenant.database.module';
import { DbListEntity } from 'src/entites/dbList.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([DbListEntity]), TenantDatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, CommonService],
})
export class UsersModule {}
