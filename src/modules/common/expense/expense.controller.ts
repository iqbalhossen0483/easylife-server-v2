import { CurrentUser } from '@/decorators/currentUser';
import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import type { JWT_Payload } from '@/types/common';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateExpenseDto,
  GetAllExpenseDto,
  GetExpenseTypesDto,
} from './expense.dto';
import { ExpenseService } from './expense.service';

@ApiTags('Expense')
@UseGuards(AuthGaurd, RoleGaurd)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('/create')
  async submit(
    @Body() payload: CreateExpenseDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.expenseService.submitExpense(payload, user.sub);
  }

  @Role(Designation.SUPER_ADMIN, Designation.ADMIN)
  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.getSingleExpense(id);
  }

  @Get('/get-all-expense-categories')
  async getAllExpenseCategories(@Query() payload: GetExpenseTypesDto) {
    return this.expenseService.getAllExpenseCategories(payload);
  }

  @Role(Designation.SUPER_ADMIN, Designation.ADMIN)
  @Get('/get-all-expenses')
  async getAll(@Query() payload: GetAllExpenseDto) {
    return this.expenseService.getAllExpenses(payload);
  }

  @Role(Designation.ADMIN)
  @Post('/approve/:id')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.expenseService.approveExpense(id, user.sub);
  }

  @Role(Designation.ADMIN)
  @Put('/reject/:id')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.rejectExpense(id);
  }
}
