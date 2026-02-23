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
import { CurrentUser } from 'src/decorators/currentUser';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import type { JWT_Payload } from 'src/types/common';
import { CreateNoteDto, GetQueryNoteDto } from './dto/notes.dto';
import {
  CreateUserCommissionTargetDto,
  GetUserCommissionTargetDto,
  UpdateUserCommissionTargetDto,
} from './dto/targetCommission.dto';
import { CreateUserDto, getAllUserDto, UpdateUserDto } from './dto/user.dto';
import { NoteService } from './services/note.service';
import { TargetCommisionService } from './services/targetCommision.service';
import { UsersService } from './services/users.service';

@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly targetCommisionService: TargetCommisionService,
    private readonly noteService: NoteService,
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

  // -------------------------------------- notes------------------------------------------------
  @Post('/note/create')
  async createNote(
    @Body() payload: CreateNoteDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.createNote(payload, user.sub);
  }

  @Get('/note/all')
  async getAllNotes(
    @Query() query: GetQueryNoteDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.getAllNotes({
      currentUserId: user.sub,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('/note/single/:id')
  async getSingleNote(@Param('id', ParseIntPipe) id: number) {
    return this.noteService.getSingleNote(id);
  }

  @Put('/note/update/:id')
  async updateNote(
    @Param('id', ParseIntPipe) noteId: number,
    @Body() payload: CreateNoteDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.updateNote(payload, noteId, user.sub);
  }

  @Delete('/note/delete/:id')
  async deleteNote(
    @Param('id', ParseIntPipe) noteId: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.softDeleteNote(noteId, user.sub);
  }
}
