import { DbListEntity } from '@/entites/dbList.entity';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

const RootDB = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    entities: [DbListEntity],
    synchronize: true,
  }),
});

@Module({
  imports: [RootDB, TypeOrmModule.forFeature([DbListEntity])],
})
export class DatabaseModule {}
