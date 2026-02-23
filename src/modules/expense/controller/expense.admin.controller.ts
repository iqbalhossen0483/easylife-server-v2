import { Controller } from '@nestjs/common';
import { ExpenseAdminService } from '../service/expense.admin.service';

@Controller('expense/admin')
export class ExpenseUserController {
  constructor(private readonly expenseService: ExpenseAdminService) {}
}
