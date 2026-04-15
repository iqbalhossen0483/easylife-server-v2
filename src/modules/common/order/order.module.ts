import { ReportUpdateService } from '@/services/report-update.service';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, ReportUpdateService],
})
export class OrderModule {}
