import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { CreateTargetDto, GetTargetDto, UpdateTargetDto } from './target.dto';
import { TargetService } from './target.service';

@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('user/target')
export class TargetController {
  constructor(private readonly targetCommisionService: TargetService) {}
  @Post('/create')
  async giveTarget(@Body() payload: CreateTargetDto) {
    return this.targetCommisionService.createUserTarget(payload);
  }

  @Put('/update/:id')
  async updateTarget(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateTargetDto,
  ) {
    return this.targetCommisionService.updateUserCommissionTarget(id, payload);
  }

  @Get('/all')
  async getAllTargets(@Query() payload: GetTargetDto) {
    return this.targetCommisionService.getAllTargets(payload);
  }

  @Get('/single/:id')
  async getSingleTarget(@Param('id', ParseIntPipe) id: number) {
    return this.targetCommisionService.getSingleTarget(id);
  }

  @Delete('/delete/:id')
  async deleteTarget(@Param('id', ParseIntPipe) id: number) {
    return this.targetCommisionService.softDeleteTarget(id);
  }
}
