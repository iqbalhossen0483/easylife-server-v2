import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import {
  ExpenseCategoryEntity,
  ExpenseEntity,
  ExpenseStatus,
} from 'src/entites/expense.entity';
import {
  PendingBalanceTransferEntity,
  TransactionEntity,
  TransferPurpose,
} from 'src/entites/transaction.entity';
import { UserEntity } from 'src/entites/user.entity';
import { BalanceTransferDto } from './transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async initiateTransfer(payload: BalanceTransferDto) {
    const currentUserId = this.tenantDbService.getCurrentUserId();
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const pendingRepo = await this.tenantDbService.getRepository(PendingBalanceTransferEntity);

    const fromUser = await userRepo.findOne({ where: { id: currentUserId } });
    if (!fromUser) throw new NotFoundException('User not found');

    const toUser = await userRepo.findOne({ where: { id: payload.to_user_id } });
    if (!toUser) throw new NotFoundException('Recipient user not found');

    if (currentUserId === payload.to_user_id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const pending = pendingRepo.create({
      from_user: fromUser,
      to_user: toUser,
      purpose: payload.purpose,
      amount: payload.amount,
      notes: payload.notes,
    });

    await pendingRepo.save(pending);

    return {
      success: true,
      message: 'Transfer initiated, awaiting acceptance',
      data: pending,
    };
  }

  async acceptTransfer(transferId: number) {
    const currentUserId = this.tenantDbService.getCurrentUserId();
    const pendingRepo = await this.tenantDbService.getRepository(PendingBalanceTransferEntity);
    const txRepo = await this.tenantDbService.getRepository(TransactionEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);

    const pending = await pendingRepo.findOne({
      where: { id: transferId },
      relations: { from_user: true, to_user: true },
    });
    if (!pending) throw new NotFoundException('Pending transfer not found');

    if (pending.to_user.id !== currentUserId) {
      throw new BadRequestException('Only the recipient can accept this transfer');
    }

    // Create transaction record
    const transaction = txRepo.create({
      from_user: pending.from_user,
      to_user: pending.to_user,
      purpose: pending.purpose,
      amount: pending.amount,
      notes: pending.notes,
    });
    await txRepo.save(transaction);

    // Update user balances based on purpose
    const amount = Number(pending.amount);

    switch (pending.purpose) {
      case TransferPurpose.SALARY:
        await userRepo.decrement({ id: pending.from_user.id }, 'have_money', amount);
        await userRepo.increment({ id: pending.to_user.id }, 'have_money', amount);
        await userRepo.increment({ id: pending.to_user.id }, 'get_salary', amount);
        await this.createAutoExpense(pending.from_user, 'Salary', amount);
        break;

      case TransferPurpose.INCENTIVE:
        await userRepo.decrement({ id: pending.from_user.id }, 'have_money', amount);
        await userRepo.increment({ id: pending.to_user.id }, 'have_money', amount);
        await userRepo.increment({ id: pending.to_user.id }, 'incentive', amount);
        await this.createAutoExpense(pending.from_user, 'Incentive', amount);
        break;

      case TransferPurpose.DEBT_PAYMENT:
        await userRepo.decrement({ id: pending.from_user.id }, 'have_money', amount);
        await userRepo.decrement({ id: pending.to_user.id }, 'debt', amount);
        break;

      case TransferPurpose.PURCHASE_PRODUCT:
      case TransferPurpose.OTHER:
        await userRepo.decrement({ id: pending.from_user.id }, 'have_money', amount);
        await userRepo.increment({ id: pending.to_user.id }, 'have_money', amount);
        break;
    }

    // Remove pending record
    await pendingRepo.delete({ id: transferId });

    return {
      success: true,
      message: 'Transfer accepted and completed',
    };
  }

  async declineTransfer(transferId: number) {
    const currentUserId = this.tenantDbService.getCurrentUserId();
    const pendingRepo = await this.tenantDbService.getRepository(PendingBalanceTransferEntity);

    const pending = await pendingRepo.findOne({
      where: { id: transferId },
      relations: { to_user: true },
    });
    if (!pending) throw new NotFoundException('Pending transfer not found');

    if (pending.to_user.id !== currentUserId) {
      throw new BadRequestException('Only the recipient can decline this transfer');
    }

    await pendingRepo.delete({ id: transferId });

    return {
      success: true,
      message: 'Transfer declined',
    };
  }

  async getPendingTransfers() {
    const currentUserId = this.tenantDbService.getCurrentUserId();
    const pendingRepo = await this.tenantDbService.getRepository(PendingBalanceTransferEntity);

    const transfers = await pendingRepo.find({
      where: { to_user: { id: currentUserId } },
      relations: { from_user: true, to_user: true },
      select: {
        from_user: { id: true, name: true, phone: true },
        to_user: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      message: 'Pending transfers fetched',
      data: transfers,
    };
  }

  async getTransactionHistory() {
    const txRepo = await this.tenantDbService.getRepository(TransactionEntity);

    const transactions = await txRepo.find({
      relations: { from_user: true, to_user: true },
      select: {
        from_user: { id: true, name: true },
        to_user: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take: 50,
    });

    return {
      success: true,
      message: 'Transaction history fetched',
      data: transactions,
    };
  }

  private async createAutoExpense(user: UserEntity, categoryName: string, amount: number) {
    try {
      const categoryRepo = await this.tenantDbService.getRepository(ExpenseCategoryEntity);
      const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

      const category = await categoryRepo.findOne({ where: { name: categoryName } });
      if (!category) return;

      const expense = expenseRepo.create({
        type: category,
        amount,
        status: ExpenseStatus.APPROVED,
        created_by: user,
        approved_by: user,
        approved_at: new Date(),
        note: `Auto-created from ${categoryName.toLowerCase()} transfer`,
      });
      await expenseRepo.save(expense);
    } catch {
      // Non-critical: don't fail the transfer if auto-expense fails
    }
  }
}
