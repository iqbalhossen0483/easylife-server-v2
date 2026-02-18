import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiValidationPipe implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    req.tenantId = Number(tenantId);

    if (isNaN(req.tenantId) || req.tenantId <= 0) {
      throw new UnauthorizedException('Missing tenant context');
    }

    next();
  }
}
