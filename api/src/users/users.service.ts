import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ContributorStatus,
  ExplicitCoverArt,
  FindUsersType,
  getUserPath,
  IUser,
  IUsersResponse,
  IUserStats,
  IUserSummary,
  NotificationType,
  SupporterStatus,
  UpdateUserPreferencesDto,
  UpdateUserProfileDto,
  UpdateUserThemeDto,
  UserCollectionViewDto,
  ReorderUserCollectionViewsDto,
} from 'shared';
import { UserCollectionView } from '../../db/entities/user-collection-view';
import { In, Repository } from 'typeorm';
import { List } from '../../db/entities/list.entity';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { User } from '../../db/entities/user.entity';
import { CurrentUserPayload } from '../auth/session.serializer';
import { ImagesService } from '../images/images.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';
import { EntitiesReferenceService } from '../entities/entitiesReference.service';

export type UserCountType =
  | 'entries'
  | 'ratings'
  | 'reviews'
  | 'followers'
  | 'following'
  | 'lists';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UserFollowing)
    private userFollowingRepository: Repository<UserFollowing>,
    @InjectRepository(UserCollectionView)
    private userCollectionViewRepository: Repository<UserCollectionView>,
    private imagesService: ImagesService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private redisService: RedisService,
    private entitiesReferenceService: EntitiesReferenceService,
  ) {}

  async getUserStats(id: string): Promise<IUserStats> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select('u.id', 'id')
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(ur.id)', 'count')
            .from(UserRelease, 'ur')
            .where('ur.userId = u.id'),
        'entriesCount',
      )
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(DISTINCT ur.ratingId)', 'count')
            .from(UserRelease, 'ur')
            .where('ur.userId = u.id AND ur.ratingId IS NOT NULL'),
        'ratingsCount',
      )
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(DISTINCT ur.reviewId)', 'count')
            .from(UserRelease, 'ur')
            .where('ur.userId = u.id AND ur.reviewId IS NOT NULL'),
        'reviewsCount',
      )
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(following.id)', 'count')
            .from(UserFollowing, 'following')
            .where('following.followerId = u.id'),
        'followingCount',
      )
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(followers.id)', 'count')
            .from(UserFollowing, 'followers')
            .where('followers.followingId = u.id'),
        'followersCount',
      )
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(lists.id)', 'count')
            .from(List, 'lists')
            .where('lists.userId = u.id AND lists.published = true'),
        'listsCount',
      )
      .where('u.id = :id', { id })
      .getRawOne();

    return result;
  }

  async getCurrentUserById(
    id: string,
  ): Promise<IUser & { allowExplicitCoverArt?: ExplicitCoverArt[] }> {
    const user = await this.usersRepository.findOne({
      select: [
        'id',
        'name',
        'username',
        'bio',
        'bioSource',
        'theme',
        'imagePath',
        'contributorStatus',
        'supporter',
        'accountStatus',
        'allowExplicitCoverArt',
      ],
      where: {
        id,
      },
    });

    return {
      ...user,
      image: this.imagesService.getUserImage(
        user.imagePath,
        user.supporter >= SupporterStatus.SUPPORTER,
      ),
      allowExplicitCoverArt: user.allowExplicitCoverArt,
    };
  }
  async getUserById(id: string): Promise<IUser> {
    const user = await this.usersRepository.findOne({
      select: [
        'id',
        'name',
        'username',
        'bio',
        'theme',
        'imagePath',
        'contributorStatus',
        'supporter',
        'accountStatus',
      ],
      where: {
        id,
      },
    });

    return {
      ...user,
      image: this.imagesService.getUserImage(
        user.imagePath,
        user.supporter >= SupporterStatus.SUPPORTER,
      ),
    };
  }

  async getUsersByIds(ids: string[]): Promise<IUserSummary[]> {
    const users = await this.usersRepository.find({
      select: [
        'id',
        'name',
        'username',
        'imagePath',
        'contributorStatus',
        'supporter',
        'theme',
      ],
      where: {
        id: In(ids),
      },
    });

    const userMap = new Map(
      users.map((user) => [
        user.id,
        {
          ...user,
          image: this.imagesService.getUserImage(
            user.imagePath,
            user.supporter >= SupporterStatus.SUPPORTER,
          ),
        },
      ]),
    );

    return ids.map((id) => userMap.get(id)).filter(Boolean);
  }

  async getUserByUsername(username: string): Promise<IUser> {
    const user = await this.usersRepository.findOne({
      select: [
        'id',
        'name',
        'username',
        'bio',
        'theme',
        'imagePath',
        'contributorStatus',
        'supporter',
        'accountStatus',
      ],
      where: {
        username: username.toLowerCase(),
      },
    });

    if (!user) throw new NotFoundException();

    return {
      ...user,
      image: this.imagesService.getUserImage(
        user.imagePath,
        user.supporter >= SupporterStatus.SUPPORTER,
      ),
    };
  }

  async isFollowing(id: string, currentUserId?: string) {
    if (!currentUserId || id === currentUserId) return false;

    return await this.userFollowingRepository.exists({
      where: {
        followerId: currentUserId,
        followingId: id,
      },
    });
  }

  async isFollowedBy(id: string, currentUserId?: string) {
    if (!currentUserId || id === currentUserId) return false;

    return await this.userFollowingRepository.exists({
      where: {
        followerId: id,
        followingId: currentUserId,
      },
    });
  }

  async userFollowers(userId: string) {
    const result = await this.userFollowingRepository
      .createQueryBuilder('f')
      .select('f.followerId', 'id')
      .where('f.followingId = :userId', { userId })
      .orderBy('f.createdAt', 'DESC')
      .getRawMany();

    const users = await this.getUsersByIds(result.map((u) => u.id));

    return { users };
  }

  async userFollowing(userId: string) {
    const result = await this.userFollowingRepository
      .createQueryBuilder('f')
      .select('f.followingId', 'id')
      .where('f.followerId = :userId', { userId })
      .orderBy('f.createdAt', 'DESC')
      .getRawMany();

    const users = await this.getUsersByIds(result.map((u) => u.id));

    return { users };
  }

  async updateProfile(
    currentUser: CurrentUserPayload,
    updateUserProfileInput: UpdateUserProfileDto,
  ) {
    updateUserProfileInput.username =
      updateUserProfileInput.username.toLowerCase();

    const updateData: any = {
      username: updateUserProfileInput.username,
      name: updateUserProfileInput.name,
    };

    if (updateUserProfileInput.bio !== undefined) {
      updateData.bioSource = updateUserProfileInput.bio;
      updateData.bio = await this.entitiesReferenceService.parseLinks(
        updateUserProfileInput.bio,
      );
    }

    await this.usersRepository.update({ id: currentUser.id }, updateData);

    if (currentUser.username !== updateUserProfileInput.username) {
      // Update username in all user sessions
      await this.redisService.updateUserSessionsUsername(
        currentUser.id,
        updateUserProfileInput.username,
      );
    }
    return true;
  }

  async updatePreferences(
    id: string,
    updateUserPreferencesInput: UpdateUserPreferencesDto,
  ) {
    await this.usersRepository.update({ id }, updateUserPreferencesInput);
    return true;
  }

  async updateImage(id: string, image: any) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['supporter', 'imagePath'],
    });
    const { path } = await this.imagesService.storeUpload(
      image,
      'user',
      user.supporter >= SupporterStatus.SUPPORTER,
    );

    if (user.imagePath) {
      await this.imagesService.deleteImage(user.imagePath, 'user');
    }

    await this.usersRepository.update(id, { imagePath: path });
    return true;
  }

  async updateTheme(id: string, theme: UpdateUserThemeDto) {
    await this.usersRepository.update(id, { theme });
    return true;
  }

  async follow(id: string, currentUserId: string, currentUserUsername: string) {
    if (id === currentUserId) throw new BadRequestException();

    const check = await this.userFollowingRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: id,
      },
    });

    if (check) throw new BadRequestException();

    const _uf = new UserFollowing();
    _uf.followerId = currentUserId;
    _uf.followingId = id;

    await this.userFollowingRepository.save(_uf);

    await this.notificationsService.createNotification({
      userId: currentUserId,
      notifyId: id,
      message: `followed you`,
      link: getUserPath({ username: currentUserUsername }),
      notificationType: NotificationType.FOLLOW,
    });

    return true;
  }
  async unFollow(id: string, currentUserId: string) {
    const uf = await this.userFollowingRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: id,
      },
    });

    if (!uf) return null;

    await this.userFollowingRepository.delete({ id: uf.id });

    await this.notificationsService.deleteNotification({
      userId: currentUserId,
      notifyId: id,
      notificationType: NotificationType.FOLLOW,
    });

    return true;
  }

  async findUsers(type: FindUsersType): Promise<IUsersResponse> {
    const qb = this.usersRepository
      .createQueryBuilder('u')
      .select('u.id', 'id');

    if (type === FindUsersType.Supporter) {
      qb.where('u.supporter = :supporter', {
        supporter: SupporterStatus.SUPPORTER,
      }).orderBy('u.supporterStartDate', 'DESC');
    } else if (type === FindUsersType.Trusted) {
      qb.where('u.contributorStatus = :status', {
        status: ContributorStatus.TRUSTED_CONTRIBUTOR,
      }).orderBy('u.createdAt', 'DESC');
    } else {
      throw new BadRequestException();
    }

    const reuslt = await qb.getRawMany();

    const users = await this.getUsersByIds(reuslt.map((user) => user.id));

    return { users };
  }

  async updateTrustedContributorStatuses(userIds: string[]) {
    const currentTrusted = await this.usersRepository.find({
      select: ['id'],
      where: {
        contributorStatus: ContributorStatus.TRUSTED_CONTRIBUTOR,
      },
    });

    const shouldBeRemoved = currentTrusted.filter(
      (u) => !userIds.some((id) => u.id === id),
    );
    const shouldBeAdded = userIds.filter(
      (id) => !currentTrusted.some((u) => u.id === id),
    );

    if (shouldBeRemoved.length > 0) {
      await this.usersRepository.update(
        shouldBeRemoved.map((c) => c.id),
        {
          contributorStatus: ContributorStatus.CONTRIBUTOR,
        },
      );

      for (const id of shouldBeRemoved.map((c) => c.id)) {
        await this.redisService.updateUserSessionsContributorStatus(
          id,
          ContributorStatus.CONTRIBUTOR,
        );
      }
    }

    if (shouldBeAdded.length > 0) {
      await this.usersRepository.update(shouldBeAdded, {
        contributorStatus: ContributorStatus.TRUSTED_CONTRIBUTOR,
      });

      for (const id of shouldBeAdded) {
        await this.redisService.updateUserSessionsContributorStatus(
          id,
          ContributorStatus.TRUSTED_CONTRIBUTOR,
        );
      }
    }

    return true;
  }

  async getCollectionViewsLimit({
    userId,
    supporter,
  }: {
    userId: string;
    supporter?: SupporterStatus;
  }): Promise<number> {
    let supporterValue = supporter;
    if (!supporterValue) {
      const user = await this.usersRepository.findOne({
        select: ['supporter'],
        where: { id: userId },
      });
      supporterValue = user.supporter;
    }
    return supporterValue >= SupporterStatus.SUPPORTER ? 10 : 2;
  }

  async getCollectionViews({
    userId,
    supporter,
  }: {
    userId: string;
    supporter?: SupporterStatus;
  }): Promise<UserCollectionView[]> {
    const limit = await this.getCollectionViewsLimit({ userId, supporter });
    const views = await this.userCollectionViewRepository.find({
      where: { userId },
      order: { order: 'ASC' },
    });
    return views.slice(0, limit);
  }

  async createCollectionView(
    userId: string,
    data: UserCollectionViewDto,
  ): Promise<UserCollectionView> {
    const limit = await this.getCollectionViewsLimit({ userId });
    const count = await this.userCollectionViewRepository.count({
      where: { userId },
    });
    if (count >= limit) {
      throw new BadRequestException(
        `You have reached the maximum limit of collection views`,
      );
    }
    const view = this.userCollectionViewRepository.create({
      userId,
      title: data.title,
      filters: data.filters,
      order: count,
    });
    return this.userCollectionViewRepository.save(view);
  }

  async updateCollectionView(
    userId: string,
    id: string,
    data: UserCollectionViewDto,
  ): Promise<UserCollectionView> {
    const view = await this.userCollectionViewRepository.findOne({
      where: { id, userId },
    });
    if (!view) {
      throw new NotFoundException('Collection view not found');
    }
    view.title = data.title;
    view.filters = data.filters;
    return this.userCollectionViewRepository.save(view);
  }

  async deleteCollectionView(userId: string, id: string): Promise<boolean> {
    const view = await this.userCollectionViewRepository.findOne({
      where: { id, userId },
    });
    if (!view) {
      throw new NotFoundException('Collection view not found');
    }
    await this.userCollectionViewRepository.remove(view);

    // Update order for other views
    const views = await this.userCollectionViewRepository.find({
      where: { userId },
      order: { order: 'ASC' },
    });
    for (let i = 0; i < views.length; i++) {
      if (views[i].order !== i) {
        views[i].order = i;
        await this.userCollectionViewRepository.save(views[i]);
      }
    }
    return true;
  }

  async reorderCollectionViews(
    userId: string,
    data: ReorderUserCollectionViewsDto,
  ): Promise<boolean> {
    const views = await this.userCollectionViewRepository.find({
      where: { userId },
    });

    for (const view of views) {
      const index = data.ids.indexOf(view.id);
      if (index !== -1 && view.order !== index) {
        view.order = index;
        await this.userCollectionViewRepository.save(view);
      }
    }
    return true;
  }
}
