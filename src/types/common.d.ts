import 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';
import { Designation } from 'src/entites/user.entity';

export interface JWT_Payload extends JwtPayload {
  tenantId: number;
  sub: number;
  phone: string;
  designation: Designation;
  jti: number;
}

declare module 'express-serve-static-core' {
  namespace Express {
    interface Request {
      user: JWT_Payload;
      tenantId: number;
      accessToken: string;
    }
  }
}

type API_Meta = {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
};
