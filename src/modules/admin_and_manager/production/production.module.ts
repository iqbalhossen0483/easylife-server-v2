import { Module } from '@nestjs/common';
import { ReportUpdateService } from 'src/services/report-update.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, ReportUpdateService],
})
export class ProductionModule {}
