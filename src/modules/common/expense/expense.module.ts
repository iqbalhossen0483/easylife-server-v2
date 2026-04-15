import { ReportUpdateService } from '@/services/report-update.service';
import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService, ReportUpdateService],
})
export class ExpenseModule {}
