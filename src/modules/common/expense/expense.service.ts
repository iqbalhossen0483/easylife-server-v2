import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import {
  ExpenseCategoryEntity,
  ExpenseEntity,
  ExpenseStatus,
} from '@/entites/expense.entity';
import { Designation, UserEntity } from '@/entites/user.entity';
import { ReportUpdateService } from '@/services/report-update.service';
import { API_Meta } from '@/types/common';
import { clampLimit } from '@/utils/file.util';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, FindOptionsWhere, Like } from 'typeorm';
import {
  CreateExpenseDto,
  GetAllExpenseDto,
  GetExpenseTypesDto,
} from './expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly tenantDbService: TenantDatabaseService,
    private readonly reportService: ReportUpdateService,
  ) {}

  async submitExpense(payload: CreateExpenseDto, currentUserId: number) {
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const categoryRepo = await this.tenantDbService.getRepository(
      ExpenseCategoryEntity,
    );
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

    const currentUser = await userRepo.findOne({
      where: { id: currentUserId },
    });
    if (!currentUser) throw new NotFoundException('User not found');

    const category = await categoryRepo.findOne({
      where: { id: payload.type_id },
    });
    if (!category) throw new NotFoundException('Expense category not found');

    // Super admin: direct approval. Others: pending
    const isAdmin = currentUser.designation === Designation.SUPER_ADMIN;

    const expense = expenseRepo.create({
      type: category,
      amount: payload.amount,
      note: payload.note,
      created_by: { id: currentUserId } as UserEntity,
      status: isAdmin ? ExpenseStatus.APPROVED : ExpenseStatus.PENDING,
    });

    if (isAdmin) {
      expense.approved_by = { id: currentUserId } as UserEntity;
      expense.approved_at = new Date();
    }

    await expenseRepo.save(expense);

    // If admin, immediately update user balance and cash reports
    if (isAdmin) {
      await userRepo.decrement(
        { id: currentUserId },
        'have_money',
        payload.amount,
      );
      await this.reportService.updateCashReport('expense', payload.amount);
    }

    return {
      success: true,
      message: isAdmin
        ? 'Expense approved and recorded'
        : 'Expense submitted for approval',
      data: expense,
    };
  }

  async approveExpense(expenseId: number, currentUserId: number) {
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

    const expense = await expenseRepo.findOne({
      where: { id: expenseId },
      relations: { created_by: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Expense is not pending');
    }

    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const expRepo = qr.manager.getRepository(ExpenseEntity);
      const userRepo = qr.manager.getRepository(UserEntity);

      expense.status = ExpenseStatus.APPROVED;
      expense.approved_by = { id: currentUserId } as UserEntity;
      expense.approved_at = new Date();
      await expRepo.save(expense);

      // Update expense creator's balance
      const creatorId = expense.created_by.id;
      await userRepo.decrement({ id: creatorId }, 'have_money', expense.amount);

      // Update cash reports
      await this.reportService.updateCashReport(
        'expense',
        expense.amount,
        qr.manager,
      );
      await this.reportService.updateCashReport(
        'payment',
        expense.amount,
        qr.manager,
      );

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Expense approved successfully',
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async rejectExpense(expenseId: number) {
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

    const expense = await expenseRepo.findOne({ where: { id: expenseId } });
    if (!expense) throw new NotFoundException('Expense not found');

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Expense is not pending');
    }

    await expenseRepo.softDelete({ id: expenseId });

    return {
      success: true,
      message: 'Expense rejected successfully',
    };
  }

  async getAllExpenses({
    page = 1,
    limit = 10,
    status,
    type_id,
    start_date,
    end_date,
  }: GetAllExpenseDto) {
    limit = clampLimit(limit);
    const skip = (page - 1) * limit;
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

    const query: FindOptionsWhere<ExpenseEntity> = {};
    if (status) query.status = status;
    if (type_id) query.type = { id: type_id };
    if (start_date && end_date) {
      query.created_at = Between(
        new Date(start_date),
        new Date(end_date + 'T23:59:59'),
      );
    }

    const [expenses, total] = await expenseRepo.findAndCount({
      where: query,
      relations: { type: true, created_by: true, approved_by: true },
      select: {
        type: { id: true, name: true },
        created_by: { id: true, name: true },
        approved_by: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Expenses fetched successfully',
      data: expenses,
      meta,
    };
  }

  async getSingleExpense(expenseId: number) {
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

    const expense = await expenseRepo.findOne({
      where: { id: expenseId },
      relations: { type: true, created_by: true, approved_by: true },
      select: {
        type: { id: true, name: true },
        created_by: { id: true, name: true },
        approved_by: { id: true, name: true },
      },
    });
    if (!expense) throw new NotFoundException('Expense not found');

    return {
      success: true,
      message: 'Expense fetched successfully',
      data: expense,
    };
  }

  async getAllExpenseCategories(payload: GetExpenseTypesDto) {
    const categoryRepo = await this.tenantDbService.getRepository(
      ExpenseCategoryEntity,
    );
    const query: FindOptionsWhere<ExpenseCategoryEntity> = {};
    if (payload.search) {
      query.name = Like(`%${payload.search}%`);
    }
    const categories = await categoryRepo.find({
      where: query,
      order: { name: 'ASC' },
    });

    return {
      success: true,
      message: 'Expense categories fetched successfully',
      data: categories,
    };
  }
}
