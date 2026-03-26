import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { CreateProductionDto, GetAllProductionDto } from './production.dto';
import { ProductionService } from './production.service';

@ApiTags('Production')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN, Designation.STORE_MANAGER)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('/create')
  async create(@Body() payload: CreateProductionDto) {
    return this.productionService.createProduction(payload);
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllProductionDto) {
    return this.productionService.getAllProductions(payload);
  }
}
