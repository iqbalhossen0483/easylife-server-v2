import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
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

    const meta = {
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
      const user = await this.getUser({ phone: payload.phone });
      if (user) {
        throw new ConflictException('User already exists');
      }
    }

    if (payload.password) {
      const hashPassword = this.hashPass(payload.password);
      payload.password = hashPassword;
    }

    const updatedUserResult = await userRepo.update(
      { id: userId },
      Object.assign(user, payload),
    );

    if (updatedUserResult.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    return {
      success: true,
      message: 'User updated successfully',
    };
  }
}
