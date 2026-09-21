import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SubmissionModule } from '../submission/submission.module';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [TasksService],
  imports: [SubmissionModule, UsersModule],
})
export class TasksModule {}
