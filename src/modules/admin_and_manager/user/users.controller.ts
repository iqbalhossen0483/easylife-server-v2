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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { multerConfig } from 'src/configs/multer.config';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { CreateUserDto, getAllUserDto, UpdateUserDto } from './user.dto';
import { UsersService } from './users.service';

@ApiTags('User Management')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
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
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
    return this.usersService.updateUser(id, payload);
  }

  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDeleteUser(id);
  }

  @Get('/recent-activity/:id')
  async recentActivity(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getRecentActivity(id);
  }
}
