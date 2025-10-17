import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../db/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { EntitiesService } from '../entities/entities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ArtistsService } from '../artists/artists.service';
import { ReleasesService } from '../releases/releases.service';
import { LabelsService } from '../labels/labels.service';
import {
  UpdateUserContributorStatusDto,
  UpdateUserSupporterStatusDto,
  UpdateAccountStatusDto,
  SendNotificationDto,
  NotificationType,
  AccountStatus,
  SupporterStatus,
} from 'shared';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
    private entitiesService: EntitiesService,
    private notificationsService: NotificationsService,
    private artistsService: ArtistsService,
    private releasesService: ReleasesService,
    private labelsService: LabelsService,
  ) {}

  async updateUserContributorStatus(
    updateUserContributorStatusDto: UpdateUserContributorStatusDto,
  ) {
    const { userId, status } = updateUserContributorStatusDto;

    await this.userRepository.update(userId, {
      contributorStatus: status,
    });

    // Update contributorStatus in all user sessions
    await this.redisService.updateUserSessionsContributorStatus(userId, status);

    return true;
  }

  async updateUserSupporterStatus(
    updateUserSupporterStatusDto: UpdateUserSupporterStatusDto,
  ) {
    const { userId, supporter } = updateUserSupporterStatusDto;

    await this.userRepository.update(userId, {
      supporter,
      supporterStartDate: new Date().toISOString(),
    });

    // await this.redisService.removeUserSessions(userId);

    return true;
  }

  async updateAccountStatus(updateAccountStatusDto: UpdateAccountStatusDto) {
    const { userId, status } = updateAccountStatusDto;

    const updateData: Partial<User> = {
      accountStatus: status,
    };

    if (status === AccountStatus.BANNED || status === AccountStatus.DELETED) {
      await this.entitiesService.removeUserData(userId);
      await this.redisService.removeUserSessions(userId);
      updateData.imagePath = null;
      updateData.bio = null;
      updateData.allowExplicitCoverArt = null;
      updateData.supporter = SupporterStatus.NOT_A_SUPPORTER;
      updateData.supporterStartDate = null;
      updateData.theme = null;
    } else {
      await this.redisService.updateUserSessionsAccountStatus(userId, status);
    }

    await this.userRepository.update(userId, updateData);

    return true;
  }

  async sendNotification(
    sendNotificationDto: SendNotificationDto,
    senderId: string,
  ) {
    const { userId, message, link } = sendNotificationDto;

    await this.notificationsService.createNotification({
      userId: senderId,
      notifyId: userId,
      notificationType: NotificationType.OTHER,
      message,
      link,
    });

    return true;
  }

  async mergeEntities(
    entityType: 'artist' | 'release' | 'label',
    mergeFromId: string,
    mergeIntoId: string,
  ) {
    console.log('mergeEntities', entityType, mergeFromId, mergeIntoId);
    switch (entityType) {
      case 'artist':
        return this.artistsService.mergeArtists(mergeFromId, mergeIntoId);
      case 'release':
        return this.releasesService.mergeReleases(mergeFromId, mergeIntoId);
      case 'label':
        return this.labelsService.mergeLabels(mergeFromId, mergeIntoId);
      default:
        throw new Error('Invalid entity type');
    }
  }
}
