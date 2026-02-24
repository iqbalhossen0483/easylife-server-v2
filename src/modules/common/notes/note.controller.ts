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
import { AuthGaurd } from 'src/guards/AuthGaurd';
import type { JWT_Payload } from 'src/types/common';
import { NoteService } from './note.service';
import { CreateNoteDto, GetQueryNoteDto } from './notes.dto';

@UseGuards(AuthGaurd)
@Controller('/user/note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post('/create')
  async createNote(
    @Body() payload: CreateNoteDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.createNote(payload, user.sub);
  }

  @Get('/all')
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

  @Get('/single/:id')
  async getSingleNote(@Param('id', ParseIntPipe) id: number) {
    return this.noteService.getSingleNote(id);
  }

  @Put('/update/:id')
  async updateNote(
    @Param('id', ParseIntPipe) noteId: number,
    @Body() payload: CreateNoteDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.updateNote(payload, noteId, user.sub);
  }

  @Delete('/delete/:id')
  async deleteNote(
    @Param('id', ParseIntPipe) noteId: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.noteService.softDeleteNote(noteId, user.sub);
  }
}
