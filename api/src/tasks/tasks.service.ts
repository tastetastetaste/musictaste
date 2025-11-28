import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubmissionService } from '../submission/submission.service';

@Injectable()
export class TasksService {
  constructor(private readonly submissionService: SubmissionService) {}

  @Cron('0 0 * * *') // every day at midnight
  async updateTrustedContributorStatuses() {
    await this.submissionService.updateTrustedContributorStatuses();
  }
}
