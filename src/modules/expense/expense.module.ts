import { Module } from '@nestjs/common';
import { ExpenseUserController } from './controller/expense.admin.controller';
import { ExpenseAdminController } from './controller/expense.user.controller';
import { ExpenseAdminService } from './service/expense.admin.service';
import { ExpenseUserService } from './service/expense.user.service';

@Module({
  controllers: [ExpenseAdminController, ExpenseUserController],
  providers: [ExpenseAdminService, ExpenseUserService],
})
export class ExpenseModule {}
