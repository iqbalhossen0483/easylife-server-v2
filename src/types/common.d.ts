import 'express-serve-static-core';

type JWT_Payload = {
  tenantId: number;
  sub: number;
  phone: string;
  designation: string;
};

declare module 'express-serve-static-core' {
  namespace Express {
    interface Request {
      user: JWT_Payload;
      tenantId: number;
    }
  }
}
