import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { DatabaseModule } from './database/root.database.module';
import { ApiValidationPipe } from './middleware/api.validation.pipe';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, AuthModule],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiValidationPipe).forRoutes('*');
  }
}
