import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { NotesEntity } from 'src/entites/notes.entity';
import { Target } from 'src/entites/target.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { CreateUserDto, getAllUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    return user;
  }

  private hashPass(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private deleteOldImage(filename: string | null | undefined) {
    if (!filename) return;
    const filePath = join(process.cwd(), 'public', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  async createUser(payload: CreateUserDto) {
    const currentUserId = this.tenantDatabaseService.getCurrentUserId();

    const user = await this.getUser({ phone: payload.phone });
    if (user) {
      throw new ConflictException('User already exists');
    }

    const currentUser = await this.getUser({ id: currentUserId });

    const hashPassword = this.hashPass(payload.password);
    payload.password = hashPassword;

    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const newUser = userRepo.create({ ...payload, createdBy: currentUser });
    await userRepo.save(newUser);

    // Increment tenant user count
    await this.tenantDatabaseService.updateTenantCount('current_user', true);

    const { password, createdBy, ...rest } = newUser;

    return {
      success: true,
      message: 'User created successfully',
      data: rest,
    };
  }

  async getAllUser({ page = 1, limit = 10, search }: getAllUserDto) {
    const skip = (page - 1) * limit;

    const query: FindOptionsWhere<UserEntity>[] = [];
    if (search) {
      query.push({ name: ILike(`%${search}%`) });
      query.push({ phone: ILike(`%${search}%`) });
    }
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const users = await userRepo.find({
      where: query,
      relations: { createdBy: true },
      select: {
        id: true,
        phone: true,
        name: true,
        address: true,
        designation: true,
        profile: true,
        haveMoney: true,
        debt: true,
        totalSale: true,
        dueSale: true,
        dueCollection: true,
        deliveredOrder: true,
        createdAt: true,
        createdBy: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    const total = await userRepo.count({
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
      message: 'Users fetched successfully',
      data: users,
      meta,
    };
  }

  async getSingleUser(userId: number) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: { createdBy: true },
      select: {
        createdBy: {
          id: true,
          name: true,
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = user;

    return {
      success: true,
      message: 'User fetched successfully',
      data: rest,
    };
  }

  async updateUser(userId: number, payload: UpdateUserDto) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (payload.phone) {
      const existing = await this.getUser({ phone: payload.phone });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Phone number already in use');
      }
    }

    if (payload.password) {
      payload.password = this.hashPass(payload.password);
    }

    // Delete old profile image if new one is uploaded
    if (payload.profile && user.profile) {
      this.deleteOldImage(user.profile);
    }

    await userRepo.update({ id: userId }, payload);

    return {
      success: true,
      message: 'User updated successfully',
    };
  }

  async softDeleteUser(userId: number) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUserResult = await userRepo.softDelete({ id: userId });

    if (deletedUserResult.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    // Decrement tenant user count
    await this.tenantDatabaseService.updateTenantCount('current_user', false);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async getRecentActivity(userId: number) {
    const user = await this.getUser({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Targets
    const targetRepo = await this.tenantDatabaseService.getRepository(Target);
    const targets = await targetRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Notes
    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);
    const notes = await noteRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // TODO: Add orders, collections, expenses when those modules are built

    return {
      success: true,
      message: 'Recent activity fetched successfully',
      data: {
        targets,
        notes,
        orders: [],
        collections: [],
        expenses: [],
      },
    };
  }
}
