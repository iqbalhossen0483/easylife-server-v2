import { Module } from '@nestjs/common';
import { ReportUpdateService } from 'src/services/report-update.service';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService, ReportUpdateService],
})
export class ExpenseModule {}
