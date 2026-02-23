import { Module } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { TargetCommisionService } from './targetCommision.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, TargetCommisionService, NotificationService],
})
export class UsersModule {}
