import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/entites/user.entity';
import { DataSource } from 'typeorm';

const tenantDataSources = new Map<string, DataSource>();

export async function getTenantDataSource(
  dbName: string,
  configService: ConfigService,
): Promise<DataSource> {
  if (tenantDataSources.has(dbName)) {
    return tenantDataSources.get(dbName)!;
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASS'),
    database: dbName,
    entities: [UserEntity],
    synchronize: true,
  });

  await dataSource.initialize();
  tenantDataSources.set(dbName, dataSource);

  return dataSource;
}
