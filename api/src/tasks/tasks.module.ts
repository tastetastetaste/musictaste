import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SubmissionModule } from '../submission/submission.module';

@Module({
  providers: [TasksService],
  imports: [SubmissionModule],
})
export class TasksModule {}
