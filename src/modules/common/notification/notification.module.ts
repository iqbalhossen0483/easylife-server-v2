import { NotificationService } from '@/services/notification.service';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
