import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { DatabaseModule } from './database/root.database.module';
import { TenantDatabaseModule } from './database/tenant.database.module';
import { ApiValidationPipe } from './middleware/api.validation.pipe';
import { AuthModule } from './modules/auth/auth.module';
import { NoteModule } from './modules/user_modules/notes/notes.module';
import { ReportModule } from './modules/user_modules/report/report.module';
import { TargetModule } from './modules/user_modules/targets/target.module';
import { TransactionModule } from './modules/user_modules/transaction/transaction.module';
import { UsersModule } from './modules/user_modules/user/users.module';

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
