import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './configs/app.config.module';
import { DatabaseModule } from './configs/db.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { ApiValidationPipe } from './middleware/api.validation.pipe';

@Module({
  imports: [AppConfigModule, DatabaseModule, JWTConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiValidationPipe).forRoutes('/api');
  }
}
