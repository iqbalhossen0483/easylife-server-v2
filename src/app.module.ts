import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { RedisConfigModule } from './configs/redis.config.module';
import { ThrottlerConfigModule } from './configs/throttler.config.module';
import { winstonConfig } from './configs/winston.config';
import { DatabaseModule } from './database/root.database.module';
import { TenantDatabaseModule } from './database/tenant.database.module';
import { ApiValidationPipe } from './middleware/api.validation.pipe';
import { ExpenseCategoryModule } from './modules/admin_and_manager/expense_category/expense.category.module';
import { ReportModule } from './modules/admin_and_manager/report/report.module';
import { TargetModule } from './modules/admin_and_manager/targets/target.module';
import { UsersModule } from './modules/admin_and_manager/user/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/common/customer/customer.module';
import { NoteModule } from './modules/common/notes/notes.module';
import { TenantModule } from './modules/admin_and_manager/tenant/tenant.module';
import { TransactionModule } from './modules/common/transaction/transaction.module';

@Module({
  imports: [
    AppConfigModule,
    WinstonModule.forRoot(winstonConfig),
    DatabaseModule,
    TenantDatabaseModule,
    JWTConfigModule,
    RedisConfigModule,
    ThrottlerConfigModule,
    AuthModule,
    ExpenseCategoryModule,
    UsersModule,
    TargetModule,
    TenantModule,
    CustomerModule,
    NoteModule,
    ReportModule,
    TransactionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiValidationPipe).forRoutes('*');
  }
}
