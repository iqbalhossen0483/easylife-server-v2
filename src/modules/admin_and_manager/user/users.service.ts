import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { NotesEntity } from 'src/entites/notes.entity';
import { Target } from 'src/entites/target.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { deleteFile, clampLimit } from 'src/utils/file.util';
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

  async createUser(payload: CreateUserDto, currentUserId: number) {
    const user = await this.getUser({ phone: payload.phone });
    if (user) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = this.hashPass(payload.password);
    payload.password = hashPassword;

    const qr = await this.tenantDatabaseService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const userRepo = qr.manager.getRepository(UserEntity);
      const newUser = userRepo.create({
        ...payload,
        created_by: { id: currentUserId } as UserEntity,
      });
      await userRepo.save(newUser);

      // Increment tenant user count
      await this.tenantDatabaseService.updateTenantCount('current_user', true);

      await qr.commitTransaction();

      const { password, created_by, ...rest } = newUser;

      return {
        success: true,
        message: 'User created successfully',
        data: rest,
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getAllUser({ page = 1, limit = 10, search }: getAllUserDto) {
    limit = clampLimit(limit);
    const skip = (page - 1) * limit;

    const query: FindOptionsWhere<UserEntity>[] = [];
    if (search) {
      query.push({ name: ILike(`%${search}%`) });
      query.push({ phone: ILike(`%${search}%`) });
    }
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const users = await userRepo.find({
      where: query,
      relations: { created_by: true },
      select: {
        id: true,
        phone: true,
        name: true,
        address: true,
        designation: true,
        profile: true,
        have_money: true,
        debt: true,
        total_sale: true,
        due_sale: true,
        due_collection: true,
        delivered_order: true,
        created_at: true,
        created_by: {
          id: true,
          name: true,
        },
      },
      order: { created_at: 'DESC' },
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
      relations: { created_by: true },
      select: {
        created_by: {
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
      await deleteFile(user.profile);
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
