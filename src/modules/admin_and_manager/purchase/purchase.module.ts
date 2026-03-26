import { Module } from '@nestjs/common';
import { ReportUpdateService } from 'src/services/report-update.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, ReportUpdateService],
})
export class PurchaseModule {}
