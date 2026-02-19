import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role_Key } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';

@Injectable()
export class RoleGaurd implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Designation[]>(Role_Key, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    const hasRole = () => roles.includes(user.designation);
    const isNotForbidden = user && !!user.designation && hasRole();
    if (!isNotForbidden) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return isNotForbidden;
  }
}
