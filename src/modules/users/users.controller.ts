import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { CreateUserDto } from './user.dto';
import { UsersService } from './users.service';

@UseGuards(AuthGaurd)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RoleGaurd)
  @Role(Designation.ADMIN)
  @Post('/create')
  async create(
    @Body() payload: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.createUser(payload, res);
  }
}
