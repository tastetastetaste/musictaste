import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../db/entities/notification.entity';
import { getUserPath, INotificationsResponse } from 'shared';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createNotification({
    userId,
    notifyId,
    message,
    link,
    notificationType,
  }: Pick<
    Notification,
    'userId' | 'notifyId' | 'message' | 'link' | 'notificationType'
  >): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      notifyId,
      message,
      link,
      notificationType,
    });

    const user = await this.usersService.getUserById(userId);

    await this.notificationsGateway.sendNotificationToUser(notifyId, {
      ...notification,
      user,
    });

    return await this.notificationsRepository.save(notification);
  }

  async extractMentionedUsers(text: string) {
    const mentions = text.match(/@[^\s]+/g);
    if (!mentions) {
      return {
        updatedText: text,
        mentionedUsers: [],
      };
    }

    // mentions without duplicates
    const mentionedUsers = Array.from(
      new Set(mentions.map((mention) => mention.replace('@', ''))),
    );
    return {
      // replace mentions with markdown relative links e.g. @username -> [@username](/username)
      updatedText: text.replace(
        /@[^\s]+/g,
        (mention) =>
          `[${mention}](${getUserPath({ username: mention.replace('@', '') })})`,
      ),
      mentionedUsers,
    };
  }

  async find({
    userId,
    page,
  }: {
    userId: string;
    page: number;
  }): Promise<INotificationsResponse> {
    const pageSize = 12;

    const [notifications, totalItems] =
      await this.notificationsRepository.findAndCount({
        where: { notifyId: userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    const uniqueUserIds = [
      ...new Set(notifications.map((notification) => notification.userId)),
    ];

    const users = await this.usersService.getUsersByIds(uniqueUserIds);

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return {
      notifications: notifications.map((notification) => ({
        ...notification,
        user: usersMap.get(notification.userId),
      })),
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      totalItems,
      currentItems: (page - 1) * pageSize + notifications.length,
      itemsPerPage: pageSize,
    };
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { notifyId: userId, read: false },
      { read: true },
    );
    return;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { notifyId: userId, read: false },
    });
  }
}
