import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { JWTConfigModule } from 'src/configs/jwt.config.module';
import { TenantDatabaseModule } from 'src/database/tenant.database.module';
import { DbListEntity } from 'src/entites/dbList.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JWTConfigModule,
    TypeOrmModule.forFeature([DbListEntity]),
    TenantDatabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CommonService],
})
export class AuthModule {}
