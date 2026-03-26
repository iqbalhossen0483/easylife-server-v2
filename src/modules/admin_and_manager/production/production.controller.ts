import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/currentUser';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import type { JWT_Payload } from 'src/types/common';
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
