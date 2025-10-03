import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityType,
  getListPath,
  getReleasePath,
  getReviewPath,
  getUserPath,
} from 'shared';
import { Repository } from 'typeorm';
import { List } from '../../db/entities/list.entity';
import { Release } from '../../db/entities/release.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { User } from '../../db/entities/user.entity';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRelease)
    private userReleasesRepository: Repository<UserRelease>,
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    @InjectRepository(Release)
    private releasesRepository: Repository<Release>,
  ) {}

  async getEntityOwnerId(
    entityType: EntityType,
    entityId: string,
  ): Promise<string> {
    switch (entityType) {
      case EntityType.USER:
        return entityId;
      case EntityType.REVIEW:
        const entry = await this.userReleasesRepository
          .createQueryBuilder('ur')
          .select(['ur.userId'])
          .where('ur.reviewId = :reviewId', { reviewId: entityId })
          .getOne();

        return entry ? entry.userId : null;
      case EntityType.LIST:
        const list = await this.listsRepository.findOne({
          select: ['id', 'userId'],
          where: { id: entityId },
        });
        return list ? list.userId : null;
      default:
        return null;
    }
  }

  async getEntityPath(
    entityType: EntityType,
    entityId: string,
  ): Promise<string> {
    switch (entityType) {
      case EntityType.USER:
        const username = await this.getUsernameByUserId(entityId);
        return getUserPath({ username });
      case EntityType.REVIEW:
        const entryId = await this.getEntryIdByReviewId(entityId);
        return getReviewPath({ entryId });
      case EntityType.LIST:
        return getListPath({ listId: entityId });
      case EntityType.RELEASE:
        return getReleasePath({ releaseId: entityId });
      default:
        return null;
    }
  }

  getEntityName(entityType: EntityType): string {
    switch (entityType) {
      case EntityType.USER:
        return 'Profile';
      case EntityType.REVIEW:
        return 'Review';
      case EntityType.LIST:
        return 'List';
      case EntityType.RELEASE:
        return 'Release';
      case EntityType.RELEASE_TRACK:
        return 'Release Track';
      default:
        return null;
    }
  }

  async getEntryIdByReviewId(reviewId: string): Promise<string> {
    const entry = await this.userReleasesRepository.findOne({
      where: { reviewId },
      select: ['id'],
    });
    return entry ? entry.id : null;
  }

  async getUsernameByUserId(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['username'],
    });
    return user ? user.username : null;
  }

  async getUserIdByUsername(username: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: ['id'],
    });
    return user ? user.id : null;
  }
}
