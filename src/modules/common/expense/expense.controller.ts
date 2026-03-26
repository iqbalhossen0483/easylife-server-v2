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
import { CurrentUser } from 'src/decorators/currentUser';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import type { JWT_Payload } from 'src/types/common';
import { CreateExpenseDto, GetAllExpenseDto } from './expense.dto';
import { ExpenseService } from './expense.service';

@ApiTags('Expense')
@UseGuards(AuthGaurd)
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

  @Get('/all')
  async getAll(@Query() payload: GetAllExpenseDto) {
    return this.expenseService.getAllExpenses(payload);
  }

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Post('/approve/:id')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.expenseService.approveExpense(id, user.sub);
  }

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Delete('/reject/:id')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.rejectExpense(id);
  }
}
