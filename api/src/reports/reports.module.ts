import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [MailModule, UsersModule, CommentsModule],
})
export class ReportsModule {}
