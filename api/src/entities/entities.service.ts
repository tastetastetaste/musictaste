import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntityType,
  EntityType,
  getListPath,
  getReleasePath,
  getReviewPath,
  getUserPath,
  SubmissionStatus,
} from 'shared';
import { Repository } from 'typeorm';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Comment } from '../../db/entities/comment.entity';
import { LabelSubmission } from '../../db/entities/label-submission.entity';
import { ListItem } from '../../db/entities/list-item.entity';
import { ListLike } from '../../db/entities/list-like.entity';
import { List } from '../../db/entities/list.entity';
import { Notification } from '../../db/entities/notification.entity';
import { ReleaseGenreVote } from '../../db/entities/release-genre-vote.entity';
import { ReleaseSubmission } from '../../db/entities/release-submission.entity';
import { Release } from '../../db/entities/release.entity';
import { ReviewVote } from '../../db/entities/review-vote.entity';
import { TrackVote } from '../../db/entities/track-vote.entity';
import { Track } from '../../db/entities/track.entity';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { UserReleaseTag } from '../../db/entities/user-release-tag.entity';
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
    @InjectRepository(ListItem)
    private listItemsRepository: Repository<ListItem>,
    @InjectRepository(Release)
    private releasesRepository: Repository<Release>,
    @InjectRepository(UserReleaseTag)
    private userReleaseTagRepository: Repository<UserReleaseTag>,
    @InjectRepository(ReviewVote)
    private reviewVoteRepository: Repository<ReviewVote>,
    @InjectRepository(ListLike)
    private listLikeRepository: Repository<ListLike>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UserFollowing)
    private userFollowingRepository: Repository<UserFollowing>,
    @InjectRepository(ReleaseGenreVote)
    private releaseGenreVoteRepository: Repository<ReleaseGenreVote>,
    @InjectRepository(ArtistSubmission)
    private artistSubmissionRepository: Repository<ArtistSubmission>,
    @InjectRepository(ReleaseSubmission)
    private releaseSubmissionRepository: Repository<ReleaseSubmission>,
    @InjectRepository(LabelSubmission)
    private labelSubmissionRepository: Repository<LabelSubmission>,
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    @InjectRepository(TrackVote)
    private trackVotesRepository: Repository<TrackVote>,
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

  // Removes all associated data with a user account (except for submissions and submission votes).
  async removeUserData(userId: string): Promise<void> {
    await this.userReleasesRepository.delete({ userId });

    await this.userReleaseTagRepository.delete({ userId });

    await this.listsRepository.delete({ userId });

    await this.reviewVoteRepository.delete({ userId });

    await this.listLikeRepository.delete({ userId });

    await this.commentRepository.delete({ userId });

    await this.notificationRepository.delete({ userId });
    await this.notificationRepository.delete({ notifyId: userId });

    await this.userFollowingRepository.delete({ followerId: userId });
    await this.userFollowingRepository.delete({ followingId: userId });

    await this.releaseGenreVoteRepository.delete({ userId });
  }

  async mergeReleaseActivities(
    mergeFromReleaseId: string,
    mergeIntoReleaseId: string,
  ): Promise<void> {
    // Move user releases
    await this.mergeUserReleases(mergeFromReleaseId, mergeIntoReleaseId);

    // Move comments
    await this.commentRepository.update(
      { entityId: mergeFromReleaseId, entityType: CommentEntityType.RELEASE },
      { entityId: mergeIntoReleaseId },
    );

    // Move list items
    await this.mergeListItems(mergeFromReleaseId, mergeIntoReleaseId);

    // Move track votes
    await this.mergeTrackVotes(mergeFromReleaseId, mergeIntoReleaseId);
  }

  private async mergeUserReleases(
    mergeFromReleaseId: string,
    mergeIntoReleaseId: string,
  ): Promise<void> {
    // Find users who have both releases
    const conflictingUsers = await this.userReleasesRepository
      .createQueryBuilder('ur1')
      .select('ur1.userId')
      .innerJoin('user_release', 'ur2', 'ur2.userId = ur1.userId')
      .where('ur1.releaseId = :fromId', { fromId: mergeFromReleaseId })
      .andWhere('ur2.releaseId = :toId', { toId: mergeIntoReleaseId })
      .getMany();

    const conflictingUserIds = conflictingUsers.map((ur) => ur.userId);

    // Delete conflicting user releases
    if (conflictingUserIds.length > 0) {
      await this.userReleasesRepository
        .createQueryBuilder()
        .delete()
        .where('releaseId = :releaseId', { releaseId: mergeFromReleaseId })
        .andWhere('userId IN (:...userIds)', { userIds: conflictingUserIds })
        .execute();
    }

    // Update user releases
    await this.userReleasesRepository.update(
      { releaseId: mergeFromReleaseId },
      { releaseId: mergeIntoReleaseId },
    );
  }

  private async mergeListItems(
    mergeFromReleaseId: string,
    mergeIntoReleaseId: string,
  ): Promise<void> {
    // Find lists that have both releases
    const conflictingLists = await this.listItemsRepository
      .createQueryBuilder('li1')
      .select('li1.listId')
      .innerJoin('list_item', 'li2', 'li2.listId = li1.listId')
      .where('li1.releaseId = :fromId', { fromId: mergeFromReleaseId })
      .andWhere('li2.releaseId = :toId', { toId: mergeIntoReleaseId })
      .getMany();

    const conflictingListIds = conflictingLists.map((li) => li.listId);

    // Delete conflicting list items
    if (conflictingListIds.length > 0) {
      await this.listItemsRepository
        .createQueryBuilder()
        .delete()
        .where('releaseId = :releaseId', { releaseId: mergeFromReleaseId })
        .andWhere('listId IN (:...listIds)', { listIds: conflictingListIds })
        .execute();
    }

    // Update list items
    await this.listItemsRepository.update(
      { releaseId: mergeFromReleaseId },
      { releaseId: mergeIntoReleaseId },
    );
  }

  private async mergeTrackVotes(
    mergeFromReleaseId: string,
    mergeIntoReleaseId: string,
  ): Promise<void> {
    const fromTracks = await this.tracksRepository.find({
      where: { releaseId: mergeFromReleaseId },
      order: { order: 'ASC' },
    });
    const intoTracks = await this.tracksRepository.find({
      where: { releaseId: mergeIntoReleaseId },
      order: { order: 'ASC' },
    });

    for (let i = 0; i < fromTracks.length; i++) {
      if (intoTracks[i]) {
        try {
          await this.trackVotesRepository.update(
            { trackId: fromTracks[i].id },
            { trackId: intoTracks[i].id },
          );
        } catch (error) {
          // Assume error is due to unique constraint
          // Delete vote or leave it to be deleted by cascade
        }
      } else {
        await this.trackVotesRepository.delete({ trackId: fromTracks[i].id });
      }
    }
  }

  async mergeArtistActivities(
    mergeFromArtistId: string,
    mergeIntoArtistId: string,
  ): Promise<void> {
    await this.releasesRepository
      .createQueryBuilder()
      .update('release_artist')
      .set({ artistId: mergeIntoArtistId })
      .where('artistId = :mergeFromId', { mergeFromId: mergeFromArtistId })
      .execute();
  }

  async mergeLabelActivities(
    mergeFromLabelId: string,
    mergeIntoLabelId: string,
  ): Promise<void> {
    await this.releasesRepository
      .createQueryBuilder()
      .update('release_label')
      .set({ labelId: mergeIntoLabelId })
      .where('labelId = :mergeFromId', { mergeFromId: mergeFromLabelId })
      .execute();
  }

  async disapproveSubmissionsForEntity(
    entityType: 'artist' | 'release' | 'label',
    entityId: string,
  ): Promise<void> {
    switch (entityType) {
      case 'artist':
        await this.artistSubmissionRepository.update(
          { artistId: entityId },
          { submissionStatus: SubmissionStatus.DISAPPROVED },
        );
        break;
      case 'release':
        await this.releaseSubmissionRepository.update(
          { releaseId: entityId },
          { submissionStatus: SubmissionStatus.DISAPPROVED },
        );
        break;
      case 'label':
        await this.labelSubmissionRepository.update(
          { labelId: entityId },
          { submissionStatus: SubmissionStatus.DISAPPROVED },
        );
        break;
    }
  }
}
