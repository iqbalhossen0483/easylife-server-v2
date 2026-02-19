import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
import { FindOptionsWhere } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly authService: AuthService,
  ) {}

  private async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    return user;
  }

  private hasPass(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  async createUser(payload: CreateUserDto, res: Response) {
    const tenantId = this.tenantDatabaseService.getTenantId();
    const currentUserId = this.tenantDatabaseService.getCurrentUserId();

    const user = await this.getUser({ phone: payload.phone });
    if (user) {
      throw new ConflictException('User already exists');
    }

    const currentUser = await this.getUser({ id: currentUserId });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const hashPassword = this.hasPass(payload.password);
    payload.password = hashPassword;

    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const newUser = userRepo.create({ ...payload, createdBy: currentUser });
    await userRepo.save(newUser);
    const { password: _, ...rest } = newUser;

    const token = this.authService.generateToken(newUser, tenantId);

    this.authService.setCookies(res, token);

    return {
      success: true,
      message: 'User created successfully',
      data: {
        token,
        user: rest,
      },
    };
  }
}
