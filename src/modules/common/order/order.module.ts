import { Module } from '@nestjs/common';
import { ReportUpdateService } from 'src/services/report-update.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, ReportUpdateService],
})
export class OrderModule {}
