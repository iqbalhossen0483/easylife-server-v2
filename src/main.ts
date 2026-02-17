import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isProd = configService.get('NODE_ENV') === 'production';
  const apiPrefix = configService.get<string>('API_PREFIX') ?? '/api';
  const port = configService.get<string>('PORT') ?? '3000';
  const origins =
    configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000';

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: origins.split(','),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useLogger(isProd ? ['error'] : false);
  app.use(helmet());

  await app.listen(parseInt(port), () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap().catch((err) => console.log(err));
