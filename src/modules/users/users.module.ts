import { Module } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { NoteController } from './controller/note.controller';
import { UsersController } from './controller/users.controller';
import { NoteService } from './services/note.service';
import { ReportService } from './services/report.service';
import { TargetCommisionService } from './services/targetCommision.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [],
  controllers: [UsersController, NoteController],
  providers: [
    UsersService,
    TargetCommisionService,
    NotificationService,
    ReportService,
    NoteService,
  ],
})
export class UsersModule {}
