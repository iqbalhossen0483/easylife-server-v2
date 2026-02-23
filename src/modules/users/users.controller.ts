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
import {
  CreateUserCommissionTargetDto,
  GetUserCommissionTargetDto,
  UpdateUserCommissionTargetDto,
} from './dto/targetCommission.dto';
import { CreateUserDto, getAllUserDto, UpdateUserDto } from './dto/user.dto';
import { TargetCommisionService } from './services/targetCommision.service';
import { UsersService } from './services/users.service';

@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly targetCommisionService: TargetCommisionService,
  ) {}

  @Post('/create')
  async create(@Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
  }

  @Get('/all')
  async getAll(@Query() payload: getAllUserDto) {
    return this.usersService.getAllUser(payload);
  }

  @Get('/single-user/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getSingleUser(id);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, payload);
  }

  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDeleteUser(id);
  }

  // -------------------------------------- target ------------------------------------------------
  @Post('/target/create')
  async giveTarget(@Body() payload: CreateUserCommissionTargetDto) {
    return this.targetCommisionService.createUserTarget(payload);
  }

  @Put('/target/update/:id')
  async updateTarget(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserCommissionTargetDto,
  ) {
    return this.targetCommisionService.updateUserCommissionTarget(id, payload);
  }

  @Get('/target/all')
  async getAllTargets(@Query() payload: GetUserCommissionTargetDto) {
    return this.targetCommisionService.getAllTargets(payload);
  }

  @Get('/target/single/:id')
  async getSingleTarget(@Param('id', ParseIntPipe) id: number) {
    return this.targetCommisionService.getSingleTarget(id);
  }

  @Delete('/target/delete/:id')
  async deleteTarget(@Param('id', ParseIntPipe) id: number) {
    return this.targetCommisionService.softDeleteTarget(id);
  }
}
