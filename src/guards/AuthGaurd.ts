import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_Payload } from 'src/types/common';

@Injectable()
export class AuthGaurd implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization ?? '';
    const token: string =
      authorization.replace('Bearer ', '') || (request.cookies.token as string);

    if (!token) {
      throw new UnauthorizedException('Authentication failed');
    }

    try {
      const user = await this.jwtService.verifyAsync<JWT_Payload>(token);
      request.user = user;
      request.tenantId = user.tenantId;
      request.accessToken = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
