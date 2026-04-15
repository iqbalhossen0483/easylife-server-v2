import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { NotesEntity } from '@/entites/notes.entity';
import { UserEntity } from '@/entites/user.entity';
import { API_Meta } from '@/types/common';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { CreateNoteDto, UpdateNoteDto } from './notes.dto';

@Injectable()
export class NoteService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  async getUser(condition: FindOptionsWhere<UserEntity>) {
    const userRepo = await this.tenantDatabaseService.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: condition });

    return user;
  }

  async getNote(condition: FindOptionsWhere<NotesEntity>) {
    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);
    const note = await noteRepo.findOne({
      where: condition,
      relations: { user: true },
      select: {
        user: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });

    return note;
  }

  async getSingleNote(noteId: number) {
    const note = await this.getNote({ id: noteId });
    if (!note) throw new NotFoundException('Note not found');

    return {
      success: true,
      message: 'Note fetched successfully',
      data: note,
    };
  }

  async getAllNotes({
    currentUserId,
    page = 1,
    limit = 10,
  }: {
    currentUserId: number;
    page?: number;
    limit?: number;
  }) {
    const currentUser = await this.getUser({ id: currentUserId });
    if (!currentUser) throw new NotFoundException('User not found');

    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);

    const skip = (page - 1) * limit;

    const notes = await noteRepo.find({
      where: { user: { id: currentUserId } },
      relations: { user: true },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      select: {
        user: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });

    const total = await noteRepo.count({
      where: { user: { id: currentUserId } },
    });

    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Notes fetched successfully',
      data: notes,
      meta,
    };
  }

  async createNote(payload: CreateNoteDto, currentUserId: number) {
    const isExist = await this.getNote({ title: payload.title });
    if (isExist) throw new ConflictException('Note already exists');

    const currentUser = await this.getUser({ id: currentUserId });
    if (!currentUser) throw new NotFoundException('User not found');

    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);

    const note = noteRepo.create(payload);
    note.user = currentUser;
    await noteRepo.save(note);

    const { user, ...rest } = note;

    return {
      success: true,
      message: 'Note created successfully',
      data: rest,
    };
  }

  async updateNote(
    payload: UpdateNoteDto,
    noteId: number,
    currentUserId: number,
  ) {
    const note = await this.getNote({ id: noteId });
    if (!note) throw new NotFoundException('Note not found');

    if (note.user.id !== currentUserId) {
      throw new UnauthorizedException(
        'You are not authorized to update this note',
      );
    }

    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);

    const updateNote = noteRepo.merge(note, payload);
    await noteRepo.save(updateNote);

    const { user, ...rest } = updateNote;

    return {
      success: true,
      message: 'Note updated successfully',
      data: rest,
    };
  }

  async softDeleteNote(noteId: number, currentUserId: number) {
    const note = await this.getNote({ id: noteId });
    if (!note) throw new NotFoundException('Note not found');

    if (note.user.id !== currentUserId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this note',
      );
    }

    const noteRepo =
      await this.tenantDatabaseService.getRepository(NotesEntity);

    const deletedNoteResult = await noteRepo.softDelete({ id: noteId });

    if (deletedNoteResult.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    return {
      success: true,
      message: 'Note deleted successfully',
    };
  }
}
