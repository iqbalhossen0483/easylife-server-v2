import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { DatabaseModule } from './database/root.database.module';
import { TenantDatabaseModule } from './database/tenant.database.module';
import { ApiValidationPipe } from './middleware/api.validation.pipe';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TenantDatabaseModule,
    JWTConfigModule,
    AuthModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiValidationPipe).forRoutes('*');
  }
}
