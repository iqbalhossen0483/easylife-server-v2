import { Controller } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expense/user')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}
}
