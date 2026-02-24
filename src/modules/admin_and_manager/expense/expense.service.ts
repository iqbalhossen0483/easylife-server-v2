import { Injectable } from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';

@Injectable()
export class ExpenseService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}
}
