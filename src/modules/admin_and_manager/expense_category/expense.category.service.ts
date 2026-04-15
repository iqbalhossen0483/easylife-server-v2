import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { ExpenseCategoryEntity } from '@/entites/expense.entity';
import { UserEntity } from '@/entites/user.entity';
import { API_Meta } from '@/types/common';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, ILike, Not } from 'typeorm';
import {
  CreateExpenseCategoryDto,
  GetAllExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from './expense.category.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  async getExpenseCategory(option: FindOneOptions<ExpenseCategoryEntity>) {
    const expenseCategory = await this.tenantDatabaseService.getRepository(
      ExpenseCategoryEntity,
    );
    const category = await expenseCategory.findOne(option);

    return category;
  }

  async getUserById(userId: number) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: userId } });
    return user;
  }

  async createExpenseCategory(
    payload: CreateExpenseCategoryDto,
    currentUserId: number,
  ) {
    const isExist = await this.getExpenseCategory({
      where: { name: payload.name },
    });
    if (isExist) {
      throw new ConflictException('Expense category already exists');
    }

    const currentUser = await this.getUserById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const expenseCategoryRepo = await this.tenantDatabaseService.getRepository(
      ExpenseCategoryEntity,
    );

    const expenseCategory = expenseCategoryRepo.create(payload);
    expenseCategory.created_by = currentUser;
    await expenseCategoryRepo.save(expenseCategory);

    const { created_by, ...rest } = expenseCategory;

    return {
      success: true,
      message: 'Expense category created successfully',
      data: rest,
    };
  }

  async updateExpenseCategory(
    payload: UpdateExpenseCategoryDto,
    expenseCategoryId: number,
    currentUserId: number,
  ) {
    const expenseCategory = await this.getExpenseCategory({
      where: { id: expenseCategoryId },
    });
    if (!expenseCategory) {
      throw new NotFoundException('Expense category not found');
    }

    let prev_name: string | null = null;

    if (payload.name) {
      const isExist = await this.getExpenseCategory({
        where: { name: payload.name, id: Not(expenseCategoryId) },
      });
      if (isExist) {
        throw new ConflictException('Expense category already exists');
      }
      prev_name = expenseCategory.name;
    }

    const expenseCategoryRepo = await this.tenantDatabaseService.getRepository(
      ExpenseCategoryEntity,
    );

    const updateExpenseCategory = expenseCategoryRepo.merge(
      expenseCategory,
      payload,
    );

    const currentUser = await this.getUserById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    updateExpenseCategory.updated_by = currentUser;
    if (prev_name) {
      updateExpenseCategory.prev_name = prev_name;
    }

    await expenseCategoryRepo.save(updateExpenseCategory);

    const { created_by, updated_by, ...rest } = updateExpenseCategory;

    return {
      success: true,
      message: 'Expense category updated successfully',
      data: rest,
    };
  }

  async getAllExpenseCategory({
    limit = 10,
    page = 1,
    search,
  }: GetAllExpenseCategoryDto) {
    const query: FindOptionsWhere<ExpenseCategoryEntity> = {};

    if (search) {
      query.name = ILike(`%${search}%`);
    }
    const skip = (page - 1) * limit;
    const expenseCategoryRepo = await this.tenantDatabaseService.getRepository(
      ExpenseCategoryEntity,
    );

    const categories = await expenseCategoryRepo.find({
      where: query,
      order: { created_at: 'DESC' },
      take: limit,
      skip,
      relations: { created_by: true, updated_by: true },
      select: {
        created_by: {
          id: true,
          name: true,
          phone: true,
        },
        updated_by: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });

    const total = await expenseCategoryRepo.count({
      where: query,
    });

    const meta: API_Meta = {
      total,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Expense categories fetched successfully',
      data: categories,
      meta,
    };
  }

  async getSingleExpenseCategory(expenseCategoryId: number) {
    const expenseCategory = await this.getExpenseCategory({
      where: { id: expenseCategoryId },
      relations: { created_by: true, updated_by: true },
      select: {
        created_by: {
          id: true,
          name: true,
          phone: true,
        },
        updated_by: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });
    if (!expenseCategory) {
      throw new NotFoundException('Expense category not found');
    }

    return {
      success: true,
      message: 'Expense category fetched successfully',
      data: expenseCategory,
    };
  }

  async softDeleteExpenseCategory(expenseCategoryId: number) {
    const expenseCategory = await this.getExpenseCategory({
      where: { id: expenseCategoryId },
    });
    if (!expenseCategory) {
      throw new NotFoundException('Expense category not found');
    }

    const expenseCategoryRepo = await this.tenantDatabaseService.getRepository(
      ExpenseCategoryEntity,
    );

    const deletedExpenseCategoryResult = await expenseCategoryRepo.softDelete({
      id: expenseCategoryId,
    });

    if (deletedExpenseCategoryResult.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    return {
      success: true,
      message: 'Expense category deleted successfully',
    };
  }
}
