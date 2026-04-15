import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import {
  ExpenseCategoryEntity,
  ExpenseEntity,
  ExpenseStatus,
} from '@/entites/expense.entity';
import {
  PendingBalanceTransferEntity,
  TransactionEntity,
  TransferPurpose,
} from '@/entites/transaction.entity';
import { Designation, UserEntity } from '@/entites/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BalanceTransferDto } from './transaction.dto';

// Which roles can use which transfer purposes
const TRANSFER_ROLE_MAP: Record<TransferPurpose, Designation[]> = {
  [TransferPurpose.BALANCE_TRANSFER]: [
    Designation.SUPER_ADMIN,
    Designation.ADMIN,
    Designation.STORE_MANAGER,
    Designation.SALES_MAN,
  ],
  [TransferPurpose.SALARY]: [Designation.SUPER_ADMIN],
  [TransferPurpose.INCENTIVE]: [Designation.SUPER_ADMIN],
  [TransferPurpose.COMMISSION]: [Designation.SUPER_ADMIN],
  [TransferPurpose.DEBT]: [Designation.SUPER_ADMIN, Designation.ADMIN],
  [TransferPurpose.DEBT_PAYMENT]: [
    Designation.SUPER_ADMIN,
    Designation.ADMIN,
    Designation.STORE_MANAGER,
    Designation.SALES_MAN,
  ],
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async initiateTransfer(
    payload: BalanceTransferDto,
    currentUserId: number,
    senderDesignation: Designation,
  ) {
    // Validate role can use this transfer purpose
    const allowedRoles = TRANSFER_ROLE_MAP[payload.purpose];
    if (!allowedRoles.includes(senderDesignation)) {
      throw new ForbiddenException(
        `Your role cannot perform ${payload.purpose} transfers`,
      );
    }

    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const pendingRepo = await this.tenantDbService.getRepository(
      PendingBalanceTransferEntity,
    );

    const fromUser = await userRepo.findOne({
      where: { id: currentUserId },
    });
    if (!fromUser) throw new NotFoundException('Sender user not found');

    const toUser = await userRepo.findOne({
      where: { id: payload.to_user_id },
    });
    if (!toUser) throw new NotFoundException('Recipient user not found');

    if (currentUserId === payload.to_user_id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Validate sender has sufficient balance
    if (payload.purpose === TransferPurpose.DEBT_PAYMENT) {
      // Debt payment deducts from sender's debt
      if (Number(fromUser.debt) < payload.amount) {
        throw new BadRequestException(
          `Insufficient debt balance. Your debt: ${fromUser.debt}`,
        );
      }
    } else {
      // All other transfers deduct from sender's have_money
      if (Number(fromUser.have_money) < payload.amount) {
        throw new BadRequestException(
          `Insufficient balance. Your balance: ${fromUser.have_money}`,
        );
      }
    }

    const pending = pendingRepo.create({
      from_user: { id: currentUserId } as UserEntity,
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

  async acceptTransfer(transferId: number, currentUserId: number) {
    const pendingRepo = await this.tenantDbService.getRepository(
      PendingBalanceTransferEntity,
    );

    const pending = await pendingRepo.findOne({
      where: { id: transferId },
      relations: { from_user: true, to_user: true },
    });
    if (!pending) throw new NotFoundException('Pending transfer not found');

    if (pending.to_user.id !== currentUserId) {
      throw new BadRequestException(
        'Only the recipient can accept this transfer',
      );
    }

    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const txRepo = qr.manager.getRepository(TransactionEntity);
      const userRepo = qr.manager.getRepository(UserEntity);
      const pendRepo = qr.manager.getRepository(PendingBalanceTransferEntity);

      // Create transaction record
      const transaction = txRepo.create({
        from_user: pending.from_user,
        to_user: pending.to_user,
        purpose: pending.purpose,
        amount: pending.amount,
        notes: pending.notes,
      });
      await txRepo.save(transaction);

      const amount = Number(pending.amount);
      const senderId = pending.from_user.id;
      const receiverId = pending.to_user.id;

      switch (pending.purpose) {
        case TransferPurpose.BALANCE_TRANSFER:
          await userRepo.decrement({ id: senderId }, 'have_money', amount);
          await userRepo.increment({ id: receiverId }, 'have_money', amount);
          break;

        case TransferPurpose.SALARY:
          await userRepo.decrement({ id: senderId }, 'have_money', amount);
          await userRepo.increment({ id: receiverId }, 'get_salary', amount);
          await this.createAutoExpense(pending.from_user, 'Salary', amount);
          break;

        case TransferPurpose.INCENTIVE:
          await userRepo.decrement({ id: senderId }, 'have_money', amount);
          await userRepo.increment({ id: receiverId }, 'incentive', amount);
          await this.createAutoExpense(pending.from_user, 'Incentive', amount);
          break;

        case TransferPurpose.COMMISSION:
          await userRepo.decrement({ id: senderId }, 'have_money', amount);
          await userRepo.increment({ id: receiverId }, 'incentive', amount);
          await this.createAutoExpense(pending.from_user, 'Commission', amount);
          break;

        case TransferPurpose.DEBT:
          await userRepo.decrement({ id: senderId }, 'have_money', amount);
          await userRepo.increment({ id: receiverId }, 'debt', amount);
          break;

        case TransferPurpose.DEBT_PAYMENT:
          // No deduction from sender, just reduce sender's debt and add to receiver's have_money
          await userRepo.decrement({ id: senderId }, 'debt', amount);
          await userRepo.increment({ id: receiverId }, 'have_money', amount);
          break;
      }

      // Remove pending record
      await pendRepo.delete({ id: transferId });

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Transfer accepted and completed',
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async declineTransfer(transferId: number, currentUserId: number) {
    const pendingRepo = await this.tenantDbService.getRepository(
      PendingBalanceTransferEntity,
    );

    const pending = await pendingRepo.findOne({
      where: { id: transferId },
      relations: { to_user: true },
    });
    if (!pending) throw new NotFoundException('Pending transfer not found');

    if (pending.to_user.id !== currentUserId) {
      throw new BadRequestException(
        'Only the recipient can decline this transfer',
      );
    }

    await pendingRepo.delete({ id: transferId });

    return {
      success: true,
      message: 'Transfer declined',
    };
  }

  async getPendingTransfers(currentUserId: number) {
    const pendingRepo = await this.tenantDbService.getRepository(
      PendingBalanceTransferEntity,
    );

    const transfers = await pendingRepo.find({
      where: { to_user: { id: currentUserId } },
      relations: { from_user: true, to_user: true },
      select: {
        from_user: { id: true, name: true, phone: true },
        to_user: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take: 50,
    });

    return {
      success: true,
      message: 'Pending transfers fetched',
      data: transfers,
    };
  }

  async getTransactionHistory(page: number = 1, limit: number = 50) {
    const txRepo = await this.tenantDbService.getRepository(TransactionEntity);
    const skip = (page - 1) * limit;

    const transactions = await txRepo.find({
      relations: { from_user: true, to_user: true },
      select: {
        from_user: { id: true, name: true },
        to_user: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      success: true,
      message: 'Transaction history fetched',
      data: transactions,
    };
  }

  private async createAutoExpense(
    user: UserEntity,
    categoryName: string,
    amount: number,
  ) {
    try {
      const categoryRepo = await this.tenantDbService.getRepository(
        ExpenseCategoryEntity,
      );
      const expenseRepo =
        await this.tenantDbService.getRepository(ExpenseEntity);

      const category = await categoryRepo.findOne({
        where: { name: categoryName },
      });
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
    } catch (err) {
      this.logger.error(
        `Failed to create auto-expense for ${categoryName}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
