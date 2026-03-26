import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import moment from 'moment';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { PendingCommissionEntity } from 'src/entites/pending_commission.entity';
import { CommissionStatus, Target } from 'src/entites/target.entity';
import { UserEntity } from 'src/entites/user.entity';
import { NotificationService } from 'src/services/notification.service';
import { API_Meta } from 'src/types/common';
import { FindOptionsWhere, In } from 'typeorm';
import { CreateTargetDto, GetTargetDto, UpdateTargetDto } from './target.dto';

@Injectable()
export class TargetService {
  constructor(
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: condition,
      relations: { created_by: true },
    });

    return user;
  }

  async createUserTarget(payload: CreateTargetDto, currentUserId: number) {
    const targetRepo = await this.tenantDatabaseService.getRepository(Target);

    const user = await this.getUser({ id: payload.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check is user already has a pending or running target
    const isExist = await targetRepo.findOne({
      where: {
        user: { id: payload.userId },
        status: In([CommissionStatus.PENDING, CommissionStatus.RUNNING]),
      },
    });

    if (isExist) {
      throw new ConflictException(
        'User already has a pending or running target',
      );
    }

    const startDate = moment(payload.start_date, 'YYYY-MM-DD');
    const endDate = moment(payload.end_date, 'YYYY-MM-DD');

    if (startDate.isAfter(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    payload.start_date = startDate.toDate();
    payload.end_date = endDate.endOf('day').toDate();

    const today = moment().startOf('day').toDate();
    const target = targetRepo.create(payload);
    if (payload.start_date.getTime() < today.getTime()) {
      target.status = CommissionStatus.RUNNING;
    }

    const commissionAmount =
      payload.targeted_amnt * payload.commission_percentage;
    target.commission_amount = commissionAmount;

    target.user = user;
    target.created_by = { id: currentUserId } as UserEntity;

    await targetRepo.save(target);

    const { user: _, ...rest } = target;

    if (user.push_token) {
      await this.notificationService.sendNotification({
        tokens: [String(user.push_token)],
        title: 'New Performance Target Assigned',
        body: `A new performance target has been assigned to you.`,
        data: { targetId: target.id },
      });
    }

    return {
      success: true,
      message: 'Target created successfully',
      data: rest,
    };
  }

  async updateUserCommissionTarget(
    targetCommissionId: number,
    payload: UpdateTargetDto,
  ) {
    const targetRepo = await this.tenantDatabaseService.getRepository(Target);

    const target = await targetRepo.findOne({
      where: { id: targetCommissionId },
    });
    if (!target) {
      throw new NotFoundException('Target not found');
    }
    const targetUser = await this.getUser({ id: target.user.id });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (target.status === CommissionStatus.ACHIVED) {
      throw new BadRequestException('Target already achived');
    }
    if (target.status === CommissionStatus.FAILED) {
      throw new BadRequestException('Target already failed');
    }

    let startDate = moment(target.start_date, 'YYYY-MM-DD');
    let endDate = moment(target.end_date, 'YYYY-MM-DD');

    if (payload.start_date) {
      startDate = moment(payload.start_date, 'YYYY-MM-DD');
      if (startDate.isAfter(endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    if (payload.end_date) {
      endDate = moment(payload.end_date, 'YYYY-MM-DD');
      if (startDate.isAfter(endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const targeted_amnt = Number(payload.targeted_amnt ?? target.targeted_amnt);
    const commission_percentage = Number(
      payload.commission_percentage ?? target.commission_percentage,
    );
    if (payload.targeted_amnt || payload.commission_percentage) {
      const commissionAmount = targeted_amnt * commission_percentage;
      target.commission_amount = commissionAmount;
    }

    target.start_date = startDate.toDate();
    target.end_date = endDate.endOf('day').toDate();
    target.targeted_amnt = targeted_amnt;
    target.commission_percentage = commission_percentage;

    await targetRepo.save(target);

    if (targetUser.push_token) {
      await this.notificationService.sendNotification({
        tokens: [String(targetUser.push_token)],
        title: 'Target Update Notification',
        body: `Your assigned target has been revised. Kindly check your dashboard for updates.`,
        data: { targetId: target.id },
      });
    }
    return {
      success: true,
      message: 'Target updated successfully',
      data: target,
    };
  }

  async getAllTargets({ page = 1, limit = 10, status, userId }: GetTargetDto) {
    const skip = (page - 1) * limit;

    const targetRepo = await this.tenantDatabaseService.getRepository(Target);

    const query: FindOptionsWhere<Target> = {};

    if (status) {
      query.status = status;
    }
    if (userId) {
      query.user = { id: userId };
    }

    const targets = await targetRepo.find({
      where: query,
      relations: { user: true, created_by: true },
      select: {
        user: {
          id: true,
          name: true,
          phone: true,
        },
        created_by: {
          id: true,
          name: true,
          phone: true,
        },
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    const total = await targetRepo.count({
      where: query,
    });
    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Targets fetched successfully',
      data: targets,
      meta,
    };
  }

  async getSingleTarget(targetCommissionId: number) {
    const targetRepo = await this.tenantDatabaseService.getRepository(Target);

    const target = await targetRepo.findOne({
      where: { id: targetCommissionId },
      relations: { user: true, created_by: true },
      select: {
        user: {
          id: true,
          name: true,
          phone: true,
        },
        created_by: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });
    if (!target) {
      throw new NotFoundException('Target not found');
    }

    return {
      success: true,
      message: 'Target fetched successfully',
      data: target,
    };
  }

  async softDeleteTarget(targetCommissionId: number) {
    const targetRepo = await this.tenantDatabaseService.getRepository(Target);

    const target = await targetRepo.findOne({
      where: { id: targetCommissionId },
    });
    if (!target) {
      throw new NotFoundException('Target not found');
    }

    const deletedTargetResult = await targetRepo.softDelete({
      id: targetCommissionId,
    });

    if (deletedTargetResult.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    return {
      success: true,
      message: 'Target deleted successfully',
    };
  }

  async getPendingCommissions(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const pcRepo = await this.tenantDatabaseService.getRepository(
      PendingCommissionEntity,
    );

    const [commissions, total] = await pcRepo.findAndCount({
      relations: { user: true, target: true },
      select: {
        user: { id: true, name: true, phone: true },
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
      message: 'Pending commissions fetched successfully',
      data: commissions,
      meta,
    };
  }

  async approveCommission(commissionId: number) {
    const pcRepo = await this.tenantDatabaseService.getRepository(
      PendingCommissionEntity,
    );
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);

    const pending = await pcRepo.findOne({
      where: { id: commissionId },
      relations: { user: true, target: true },
    });
    if (!pending) throw new NotFoundException('Pending commission not found');

    // Add commission to user balance
    await userRepo.increment(
      { id: pending.user.id },
      'have_money',
      pending.commission,
    );
    await userRepo.increment(
      { id: pending.user.id },
      'incentive',
      pending.commission,
    );

    // Remove pending record
    await pcRepo.delete({ id: commissionId });

    return {
      success: true,
      message: 'Commission approved and transferred to user',
    };
  }

  async rejectCommission(commissionId: number) {
    const pcRepo = await this.tenantDatabaseService.getRepository(
      PendingCommissionEntity,
    );

    const pending = await pcRepo.findOne({ where: { id: commissionId } });
    if (!pending) throw new NotFoundException('Pending commission not found');

    await pcRepo.delete({ id: commissionId });

    return {
      success: true,
      message: 'Commission rejected',
    };
  }
}
