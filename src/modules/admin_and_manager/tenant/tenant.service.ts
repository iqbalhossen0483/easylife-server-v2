import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTenantDto } from './tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async getTenantInfo() {
    const tenant = await this.tenantDbService.getDataDatabase();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      success: true,
      message: 'Tenant info fetched successfully',
      data: tenant,
    };
  }

  async updateTenantInfo(payload: UpdateTenantDto) {
    const tenant = await this.tenantDbService.updateTenantInfo(payload);

    return {
      success: true,
      message: 'Tenant info updated successfully',
      data: tenant,
    };
  }
}
