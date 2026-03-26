import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbListEntity } from 'src/entites/dbList.entity';
import { ScheduledTasksService } from './scheduled-tasks.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([DbListEntity]),
  ],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
