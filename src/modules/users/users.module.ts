import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbListEntity } from 'src/entites/dbList.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([DbListEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
