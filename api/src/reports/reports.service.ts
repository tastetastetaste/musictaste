import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommentEntityType, CreateReportDto, ReportType } from 'shared';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
  ) {}
  private async getEntityInfo(type: ReportType, id: string): Promise<string> {
    try {
      switch (type) {
        case ReportType.RELEASE:
          return `https://musictaste.xyz/release/${id}`;

        case ReportType.ARTIST:
          return `https://musictaste.xyz/artist/${id}`;

        case ReportType.LABEL:
          return `https://musictaste.xyz/label/${id}`;

        case ReportType.USER:
          const user = await this.usersService.getUserById(id);
          return `User: ${user.name} @${user.username} (${user.id})
          https://musictaste.xyz/${user.username}`;

        case ReportType.REVIEW:
          return `https://musictaste.xyz/review/${id}`;

        case ReportType.LIST:
          return `https://musictaste.xyz/list/${id}`;

        case ReportType.COMMENT:
          const comment = await this.commentsService.findOne(id);
          return `${CommentEntityType[comment.entityType]}: ${comment.entityId}

Comment: ${comment.body}

User: ${comment.user.name} @${comment.user.username} (${comment.user.id})`;

        default:
          return `${type} ${id}`;
      }
    } catch (error) {
      return `${type} ${id} - Error fetching details`;
    }
  }

  async create(createReportDto: CreateReportDto, userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      return new InternalServerErrorException();
    }

    const entityInfo = await this.getEntityInfo(
      createReportDto.type,
      createReportDto.id,
    );

    const subject = `Report (${createReportDto.type}: ${createReportDto.id})`;
    const body = `Reason: 
${createReportDto.reason}

Details: 
${entityInfo}

Reported by: 
${user.name} @${user.username} (${user.id})`;

    await this.mailService.sendReportEmail({
      subject,
      body,
    });

    return {
      message: 'Report sent',
    };
  }
}
