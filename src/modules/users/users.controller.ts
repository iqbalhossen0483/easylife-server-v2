import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { CreateUserDto, getAllUserDto } from './user.dto';
import { UsersService } from './users.service';

@UseGuards(AuthGaurd)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Post('/create')
  async create(@Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
  }

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Get('/all')
  async getAll(@Query() payload: getAllUserDto) {
    return this.usersService.getAllUser(payload);
  }
}
