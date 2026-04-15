import { ReportUpdateService } from '@/services/report-update.service';
import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, ReportUpdateService],
})
export class PurchaseModule {}
