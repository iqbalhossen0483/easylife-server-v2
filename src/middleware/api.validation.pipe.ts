import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiValidationPipe implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const database = req.headers.database;
    if (!database) {
      console.log(req.url);
      throw new UnauthorizedException('Access denied');
    }
    req.query.db = database;
    next();
  }
}
