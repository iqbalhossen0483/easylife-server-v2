import { DbListEntity } from '@/entites/dbList.entity';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledTasksService } from './scheduled-tasks.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([DbListEntity])],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
