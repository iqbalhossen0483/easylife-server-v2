import { Module } from '@nestjs/common';
import { TargetCommisionService } from './targetCommision.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, TargetCommisionService],
})
export class UsersModule {}
