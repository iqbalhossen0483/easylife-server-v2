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
import { ProductModule } from './modules/admin_and_manager/product/product.module';
import { ProductionModule } from './modules/admin_and_manager/production/production.module';
import { PurchaseModule } from './modules/admin_and_manager/purchase/purchase.module';
import { ReportModule } from './modules/admin_and_manager/report/report.module';
import { SupplierModule } from './modules/admin_and_manager/supplier/supplier.module';
import { TargetModule } from './modules/admin_and_manager/targets/target.module';
import { TenantModule } from './modules/admin_and_manager/tenant/tenant.module';
import { UsersModule } from './modules/admin_and_manager/user/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/common/customer/customer.module';
import { ExpenseModule } from './modules/common/expense/expense.module';
import { NoteModule } from './modules/common/notes/notes.module';
import { NotificationModule } from './modules/common/notification/notification.module';
import { OrderModule } from './modules/common/order/order.module';
import { TransactionModule } from './modules/common/transaction/transaction.module';
import { UserSelfModule } from './modules/common/user/user_self.module';
import { ScheduledTasksModule } from './modules/scheduled/scheduled-tasks.module';

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
    UserSelfModule,
    TargetModule,
    ProductModule,
    SupplierModule,
    PurchaseModule,
    ProductionModule,
    TenantModule,
    CustomerModule,
    OrderModule,
    ExpenseModule,
    NoteModule,
    ReportModule,
    NotificationModule,
    TransactionModule,
    ScheduledTasksModule,
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
