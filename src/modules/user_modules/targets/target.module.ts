import { Module } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';

@Module({
  imports: [],
  controllers: [TargetController],
  providers: [TargetService, NotificationService],
})
export class TargetModule {}
