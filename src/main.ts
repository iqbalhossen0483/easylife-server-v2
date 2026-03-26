import type { LoggerService } from '@nestjs/common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './configs/swagger.config';
import { AllExceptionFilter } from './middleware/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const isProd = configService.get('NODE_ENV') === 'production';
  const apiPrefix = configService.get<string>('API_PREFIX') ?? '/api';
  const port = configService.get<string>('PORT') ?? '3000';
  const origins =
    configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000';

  // Winston logger
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: origins.split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const error = errors[0];
        const constraints = error.constraints;
        let message: string = 'Validation failed';
        if (constraints) {
          message = constraints[Object.keys(constraints)[0]];
        }
        return new BadRequestException(message);
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter(logger));
  app.use(helmet());
  app.use(cookieParser());

  // Serve static files from public directory
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  // Swagger docs (non-production)
  if (!isProd) {
    setupSwagger(app);
  }

  await app.listen(parseInt(port), () => {
    logger.log(`Server is running on http://localhost:${port}`, 'Bootstrap');
    if (!isProd) {
      logger.log(`Swagger docs at http://localhost:${port}/docs`, 'Bootstrap');
    }
  });
}
void bootstrap();
