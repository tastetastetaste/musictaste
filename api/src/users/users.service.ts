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
} from 'shared';
import { In, Repository } from 'typeorm';
import { List } from '../../db/entities/list.entity';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { User } from '../../db/entities/user.entity';
import { CurrentUserPayload } from '../auth/session.serializer';
import { ImagesService } from '../images/images.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';

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
    private imagesService: ImagesService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private redisService: RedisService,
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
      image: this.imagesService.getUserImage(user.imagePath),
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
      image: this.imagesService.getUserImage(user.imagePath),
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
          image: this.imagesService.getUserImage(user.imagePath),
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
      image: this.imagesService.getUserImage(user.imagePath),
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
    await this.usersRepository.update(
      { id: currentUser.id },
      updateUserProfileInput,
    );

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
    const { path } = await this.imagesService.storeUpload(image, 'user');
    await this.usersRepository.update(id, { imagePath: path });
    return true;
  }

  async updateTheme(id: string, theme: UpdateUserThemeDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'supporter'],
    });

    if (!user || !user.supporter) throw new UnauthorizedException();

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
}
