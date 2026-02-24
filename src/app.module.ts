import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { DatabaseModule } from './database/root.database.module';
import { TenantDatabaseModule } from './database/tenant.database.module';
import { ApiValidationPipe } from './middleware/api.validation.pipe';
import { ReportModule } from './modules/admin_and_manager/report/report.module';
import { TargetModule } from './modules/admin_and_manager/targets/target.module';
import { UsersModule } from './modules/admin_and_manager/user/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NoteModule } from './modules/common/notes/notes.module';
import { TransactionModule } from './modules/common/transaction/transaction.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TenantDatabaseModule,
    JWTConfigModule,
    AuthModule,
    UsersModule,
    TargetModule,
    NoteModule,
    ReportModule,
    TransactionModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiValidationPipe).forRoutes('*');
  }
}
