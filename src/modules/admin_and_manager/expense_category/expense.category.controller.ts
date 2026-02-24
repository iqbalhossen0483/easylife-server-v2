import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators/currentUser';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import type { JWT_Payload } from 'src/types/common';
import {
  CreateExpenseCategoryDto,
  GetAllExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from './expense.category.dto';
import { ExpenseCategoryService } from './expense.category.service';

@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('admin/expense_category')
export class ExpenseCategoryController {
  constructor(private readonly expenseService: ExpenseCategoryService) {}

  @Post('create')
  async createExpenseCategory(
    @Body() paylod: CreateExpenseCategoryDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.expenseService.createExpenseCategory(paylod, user.sub);
  }

  @Put('update/:id')
  async updateExpenseCategory(
    @Body() paylod: UpdateExpenseCategoryDto,
    @CurrentUser() user: JWT_Payload,
    @Param('id', ParseIntPipe) categoryId: number,
  ) {
    return this.expenseService.updateExpenseCategory(
      paylod,
      categoryId,
      user.sub,
    );
  }

  @Get('all')
  async getAllExpenseCategory(@Query() query: GetAllExpenseCategoryDto) {
    return this.expenseService.getAllExpenseCategory(query);
  }

  @Get('single/:id')
  async getSingleExpenseCategory(
    @Param('id', ParseIntPipe) categoryId: number,
  ) {
    return this.expenseService.getSingleExpenseCategory(categoryId);
  }

  @Delete('delete/:id')
  async deleteExpenseCategory(@Param('id', ParseIntPipe) categoryId: number) {
    return this.expenseService.softDeleteExpenseCategory(categoryId);
  }
}
