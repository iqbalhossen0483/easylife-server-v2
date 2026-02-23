import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import moment from 'moment';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
import {
  CommissionStatus,
  UserCommissionTarget,
} from 'src/entites/UserCommissionTarget.entity';
import { NotificationService } from 'src/notification/notification.service';
import { API_Meta } from 'src/types/common';
import { FindOptionsWhere, In } from 'typeorm';
import {
  CreateUserCommissionTargetDto,
  GetUserCommissionTargetDto,
  UpdateUserCommissionTargetDto,
} from './targetCommission.dto';

@Injectable()
export class TargetCommisionService {
  constructor(
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: condition,
      relations: { createdBy: true },
    });

    return user;
  }

  async createUserTarget(payload: CreateUserCommissionTargetDto) {
    const currentUserId = this.tenantDatabaseService.getCurrentUserId();
    const targetRepo =
      await this.tenantDatabaseService.getRepository(UserCommissionTarget);

    const user = await this.getUser({ id: payload.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentUser = await this.getUser({ id: currentUserId });
    if (!currentUser) {
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

    const startDate = moment(payload.startDate, 'YYYY-MM-DD');
    const endDate = moment(payload.endDate, 'YYYY-MM-DD');

    if (startDate.isAfter(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    payload.startDate = startDate.toDate();
    payload.endDate = endDate.endOf('day').toDate();

    const today = moment().startOf('day').toDate();
    const target = targetRepo.create(payload);
    if (payload.startDate.getTime() < today.getTime()) {
      target.status = CommissionStatus.RUNNING;
    }

    const commissionAmount =
      payload.targetedAmnt * payload.commissionPercentage;
    target.commissionAmount = commissionAmount;

    target.user = user;
    target.createdBy = currentUser;

    await targetRepo.save(target);

    const { user: _, createdBy, ...rest } = target;

    if (user.pushToken) {
      await this.notificationService.sendNotification({
        tokens: [user.pushToken],
        title: 'New Performance Target Assigned',
        body: `A new performance target has been assigned to you by ${createdBy.name}.`,
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
    payload: UpdateUserCommissionTargetDto,
  ) {
    const targetRepo =
      await this.tenantDatabaseService.getRepository(UserCommissionTarget);

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

    let startDate = moment(target.startDate, 'YYYY-MM-DD');
    let endDate = moment(target.endDate, 'YYYY-MM-DD');

    if (payload.startDate) {
      startDate = moment(payload.startDate, 'YYYY-MM-DD');
      if (startDate.isAfter(endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    if (payload.endDate) {
      endDate = moment(payload.endDate, 'YYYY-MM-DD');
      if (startDate.isAfter(endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const targetedAmnt = payload.targetedAmnt ?? target.targetedAmnt;
    const commissionPercentage =
      payload.commissionPercentage ?? target.commissionPercentage;
    if (payload.targetedAmnt || payload.commissionPercentage) {
      const commissionAmount = targetedAmnt * commissionPercentage;
      target.commissionAmount = commissionAmount;
    }

    target.startDate = startDate.toDate();
    target.endDate = endDate.endOf('day').toDate();
    target.targetedAmnt = targetedAmnt;
    target.commissionPercentage = commissionPercentage;

    await targetRepo.save(target);

    if (targetUser.pushToken) {
      await this.notificationService.sendNotification({
        tokens: [targetUser.pushToken],
        title: 'Target Update Notification',
        body: `Your assigned target has been revised by ${target.createdBy.name}. Kindly check your dashboard for updates.`,
        data: { targetId: target.id },
      });
    }
    return {
      success: true,
      message: 'Target updated successfully',
      data: target,
    };
  }

  async getAllTargets({
    page = 1,
    limit = 10,
    status,
    userId,
  }: GetUserCommissionTargetDto) {
    const skip = (page - 1) * limit;

    const targetRepo =
      await this.tenantDatabaseService.getRepository(UserCommissionTarget);

    const query: FindOptionsWhere<UserCommissionTarget> = {};

    if (status) {
      query.status = status;
    }
    if (userId) {
      query.user = { id: userId };
    }

    const targets = await targetRepo.find({
      where: query,
      relations: { user: true, createdBy: true },
      select: {
        user: {
          id: true,
          name: true,
          phone: true,
        },
        createdBy: {
          id: true,
          name: true,
          phone: true,
        },
      },
      order: { createdAt: 'DESC' },
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
    const targetRepo =
      await this.tenantDatabaseService.getRepository(UserCommissionTarget);

    const target = await targetRepo.findOne({
      where: { id: targetCommissionId },
      relations: { user: true, createdBy: true },
      select: {
        user: {
          id: true,
          name: true,
          phone: true,
        },
        createdBy: {
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
    const targetRepo =
      await this.tenantDatabaseService.getRepository(UserCommissionTarget);

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
}
