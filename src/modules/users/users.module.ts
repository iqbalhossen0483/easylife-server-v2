import { Module } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { TargetCommisionService } from './services/targetCommision.service';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, TargetCommisionService, NotificationService],
})
export class UsersModule {}
