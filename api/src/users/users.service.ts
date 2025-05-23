import { IUser, IUserStats, UpdateUserProfileDto } from 'shared';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { ReleasesService } from '../releases/releases.service';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { User } from '../../db/entities/user.entity';

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
    @Inject(forwardRef(() => ReleasesService))
    private releasesService: ReleasesService,
    private imagesService: ImagesService,
  ) {}

  async getUserStats(id: string): Promise<IUserStats> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select('u.id', 'id')
      .addSelect('COUNT(DISTINCT ur.id)', 'entriesCount')
      .addSelect('COUNT(DISTINCT ur.ratingId)', 'ratingsCount')
      .addSelect('COUNT(DISTINCT ur.reviewId)', 'reviewsCount')
      .addSelect('COUNT(DISTINCT following.id)', 'followingCount')
      .addSelect('COUNT(DISTINCT followers.id)', 'followersCount')
      .addSelect('COUNT(DISTINCT lists.id)', 'listsCount')
      .leftJoin('u.entries', 'ur')
      .leftJoin('u.following', 'following', 'following.followerId = :id', {
        id,
      })
      .leftJoin('u.followers', 'followers', 'followers.followingId = :id', {
        id,
      })
      .where('u.id = :id', { id })
      .leftJoin('u.lists', 'lists', 'lists.published = true')
      .groupBy('u.id')
      .getRawOne();

    return result;
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.usersRepository.findOne({
      select: ['id', 'name', 'username', 'bio', 'imagePath'],
      where: {
        id,
      },
    });

    return {
      ...user,
      image: this.imagesService.getUserImage(user.imagePath),
    };
  }

  async getUsersByIds(ids: string[]): Promise<IUser[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'username', 'bio', 'imagePath'],
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
      select: ['id', 'name', 'username', 'bio', 'imagePath'],
      where: {
        username,
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
    id: string,
    updateUserProfileInput: UpdateUserProfileDto,
  ) {
    updateUserProfileInput.username.toLowerCase();
    await this.usersRepository.update({ id }, updateUserProfileInput);
    return true;
  }

  async updateImage(id: string, image: any) {
    const { path } = await this.imagesService.storeUpload(image, 'user');
    await this.usersRepository.update(id, { imagePath: path });
    return true;
  }

  async follow(id: string, currentUserId: string) {
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
}
