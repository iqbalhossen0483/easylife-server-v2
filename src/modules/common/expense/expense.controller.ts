import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { CreateExpenseDto, GetAllExpenseDto } from './expense.dto';
import { ExpenseService } from './expense.service';

@ApiTags('Expense')
@UseGuards(AuthGaurd)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('/create')
  async submit(@Body() payload: CreateExpenseDto) {
    return this.expenseService.submitExpense(payload);
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllExpenseDto) {
    return this.expenseService.getAllExpenses(payload);
  }

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Post('/approve/:id')
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.approveExpense(id);
  }

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Delete('/reject/:id')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.rejectExpense(id);
  }
}
