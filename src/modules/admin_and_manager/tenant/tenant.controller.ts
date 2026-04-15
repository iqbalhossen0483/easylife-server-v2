import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateTenantDto } from './tenant.dto';
import { TenantService } from './tenant.service';

@ApiTags('Tenant')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('admin/tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('/info')
  async getTenantInfo() {
    return this.tenantService.getTenantInfo();
  }

  @Put('/update')
  async updateTenantInfo(@Body() payload: UpdateTenantDto) {
    return this.tenantService.updateTenantInfo(payload);
  }
}
