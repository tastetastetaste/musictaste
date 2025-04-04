import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReportDto } from 'shared';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}
  async create(createReportDto: CreateReportDto, userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      return new InternalServerErrorException();
    }

    await this.mailService.sendReportEmail({
      ...createReportDto,
      reason: `${createReportDto.reason}\n\nuser: ${user.name} @${user.username} (${user.id})`,
    });

    return {
      message: 'Report sent',
    };
  }
}
