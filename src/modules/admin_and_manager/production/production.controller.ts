import { CurrentUser } from '@/decorators/currentUser';
import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import type { JWT_Payload } from '@/types/common';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductionDto, GetAllProductionDto } from './production.dto';
import { ProductionService } from './production.service';

@ApiTags('Production')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.STORE_MANAGER)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('/create')
  async create(
    @Body() payload: CreateProductionDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.productionService.createProduction(payload, user.sub);
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllProductionDto) {
    return this.productionService.getAllProductions(payload);
  }
}
