import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
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
