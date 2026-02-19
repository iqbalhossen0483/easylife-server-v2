import { SetMetadata } from '@nestjs/common';
import { Designation } from 'src/entites/user.entity';

export const Role_Key = 'roles';

export const Role = (...roles: Designation[]) => SetMetadata(Role_Key, roles);
