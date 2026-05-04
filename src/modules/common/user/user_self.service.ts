import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { ExpenseEntity } from '@/entites/expense.entity';
import { NotesEntity } from '@/entites/notes.entity';
import { CollectionEntity, OrderEntity } from '@/entites/order.entity';
import { Target } from '@/entites/target.entity';
import { Designation, UserEntity } from '@/entites/user.entity';
import { JWT_Payload } from '@/types/common';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserSelfService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    return user;
  }

  async getRecentActivity(userId: number, currentUser: JWT_Payload) {
    const user = await this.getUser({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.sub !== userId &&
      currentUser.designation !== Designation.SUPER_ADMIN
    ) {
      throw new UnauthorizedException(
        "You are not authorized to view this user's activity",
      );
    }

    // Targets
    const targetRepo = await this.tenantDatabaseService.getRepository(Target);
    const targets = await targetRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: 5,
    });

    // Notes
    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);
    const notes = await noteRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: 5,
    });

    // Orders
    const orderRepo =
      await this.tenantDatabaseService.getRepository(OrderEntity);
    const orders = await orderRepo.find({
      where: [{ created_by: { id: userId } }, { delivered_by: { id: userId } }],
      order: { created_at: 'DESC' },
      take: 5,
    });

    // Collections
    const collectionRepo =
      await this.tenantDatabaseService.getRepository(CollectionEntity);
    const collections = await collectionRepo.find({
      where: { receiver: { id: userId } },
      order: { created_at: 'DESC' },
      take: 5,
    });

    // Expenses
    const expenseRepo =
      await this.tenantDatabaseService.getRepository(ExpenseEntity);
    const expenses = await expenseRepo.find({
      where: { created_by: { id: userId } },
      order: { created_at: 'DESC' },
      take: 5,
    });

    return {
      success: true,
      message: 'Recent activity fetched successfully',
      data: {
        targets,
        notes,
        orders,
        collections,
        expenses,
      },
    };
  }
}
