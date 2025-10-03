import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';

@Controller('notifications')
@UseGuards(AuthenticatedGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Query('page') page: any,
    @CurUser('id') userId: string,
  ) {
    return await this.notificationsService.find({
      userId,
      page: parseInt(page),
    });
  }

  @Get('unread-count')
  async getUnreadCount(@CurUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Post('mark-all-read')
  async markAllAsRead(@CurUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }
}
