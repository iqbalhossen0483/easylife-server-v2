import { Controller } from '@nestjs/common';
import { ExpenseUserService } from '../service/expense.user.service';

@Controller('expense/user')
export class ExpenseAdminController {
  constructor(private readonly expenseService: ExpenseUserService) {}
}
