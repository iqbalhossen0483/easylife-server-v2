import 'express-serve-static-core';
import { Designation } from 'src/entites/user.entity';

type JWT_Payload = {
  tenantId: number;
  sub: number;
  phone: string;
  designation: Designation;
};

declare module 'express-serve-static-core' {
  namespace Express {
    interface Request {
      user: JWT_Payload;
      tenantId: number;
    }
  }
}
