import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubmissionService } from '../submission/submission.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly usersService: UsersService,
  ) {}

  @Cron('0 0 * * *') // every day at midnight
  async updateTrustedContributorStatuses() {
    await this.submissionService.updateTrustedContributorStatuses();
  }

  @Cron('0 0 * * *') // every day at midnight
  async updateSupporterStatuses() {
    await this.usersService.updateSupporterStatuses();
  }
}
