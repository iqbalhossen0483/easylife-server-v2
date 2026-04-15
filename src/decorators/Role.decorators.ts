import { Designation } from '@/entites/user.entity';
import { SetMetadata } from '@nestjs/common';

export const Role_Key = 'roles';

export const Role = (...roles: Designation[]) => SetMetadata(Role_Key, roles);
