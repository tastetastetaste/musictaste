import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntityType,
  FindReviewsDto,
  IReview,
  IReviewResponse,
  IReviewVote,
  ReviewsSortByEnum,
  VoteType,
} from 'shared';
import { In, Repository } from 'typeorm';
import { ReviewVote } from '../../db/entities/review-vote.entity';
import { Review } from '../../db/entities/review.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { CommentsService } from '../comments/comments.service';
import { EntitiesReferenceService } from '../entities/entitiesReference.service';
import { ReleasesService } from '../releases/releases.service';
import { UsersService } from '../users/users.service';
import { mapEntries } from './entries.utils';

export class ReviewsService {
  constructor(
    @InjectRepository(UserRelease)
    private userReleaseRepository: Repository<UserRelease>,
    @InjectRepository(Review) private reviewsRepository: Repository<Review>,
    @InjectRepository(ReviewVote)
    private reviewVoteRepository: Repository<ReviewVote>,
    private releasesService: ReleasesService,
    private usersService: UsersService,
    private commentsService: CommentsService,
    private entitiesReferenceService: EntitiesReferenceService,
  ) {}

  async findOne(entryId: string): Promise<IReviewResponse> {
    const ur = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rating', 'rating')
      .leftJoinAndSelect('ur.tags', 'tags')
      .leftJoinAndSelect('ur.trackVotes', 'vote')
      .leftJoinAndSelect('vote.track', 'track')
      .where('ur.id = :id', { id: entryId })
      .getOne();

    if (!ur || !ur.reviewId) {
      return { entry: null };
    }

    const [[release], user, [review]] = await Promise.all([
      this.releasesService.getReleasesByIds([ur.releaseId]),
      this.usersService.getUserById(ur.userId),
      this.getReviewsByIds([ur.reviewId]),
    ]);

    return {
      entry: {
        ...ur,
        user,
        release,
        review,
      },
    };
  }

  async find(params: FindReviewsDto) {
    const { releaseId, userId, sortBy, page, pageSize } = params;

    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rating', 'rating')
      .innerJoin('ur.review', 'review');

    if (userId) {
      urQB.where('ur.userId = :userId', { userId });
    } else if (releaseId) {
      urQB.where('ur.releaseId = :releaseId', { releaseId });
    } else {
      urQB.where("review.createdAt >= current_date - interval '72 hours'");
    }

    // --- sort by

    switch (sortBy) {
      case ReviewsSortByEnum.ReviewTop:
        urQB
          .leftJoin('review.votes', 'votes')
          .orderBy('SUM(votes.vote)', 'DESC', 'NULLS LAST')
          .groupBy('ur.id')
          .addGroupBy('rating.id');

        break;

      default: // ReviewsSortByEnum.ReviewDate:
        urQB.orderBy('review.createdAt', 'DESC');

        break;
    }

    // --

    const [result, totalItems] = await urQB
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getManyAndCount();

    if (result.length === 0) {
      return {
        entries: [],
        totalItems,
        currentPage: page,
        currentItems: (page - 1) * pageSize,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
      };
    }

    const [reviews, releases, users] = await Promise.all([
      this.getReviewsByIds(result.map((ur) => ur.reviewId!)),
      !releaseId
        ? this.releasesService.getReleasesByIds(
            result.map((ur) => ur.releaseId),
          )
        : Promise.resolve(null),
      !userId
        ? this.usersService.getUsersByIds(result.map((ur) => ur.userId))
        : Promise.resolve(null),
    ]);

    return {
      entries: mapEntries(result, { reviews, releases, users }),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + result.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async getUserReviewVotes(
    ids: string[],
    currentUserId: string,
  ): Promise<IReviewVote[]> {
    if (!ids || !ids.length) return [];

    const votes = await this.reviewVoteRepository.find({
      where: {
        reviewId: In(ids),
        userId: currentUserId,
      },
    });

    return ids.map((id) => ({
      reviewId: id,
      vote: votes.find((v) => v.reviewId === id)?.vote,
    }));
  }

  async getReviewSummary(id: string) {
    const review = await this.reviewsRepository
      .createQueryBuilder('r')
      .select('r.id', 'id')
      .addSelect('r.body', 'body')
      .addSelect('r.bodySource', 'bodySource')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('r.updatedAt', 'updatedAt')
      .where('r.id = :reviewId', { reviewId: id })
      .getRawOne();

    return review;
  }

  private async getReviewsByIds(ids: string[]): Promise<IReview[]> {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('r')
      .select('r.id', 'id')
      .addSelect('r.body', 'body')
      .addSelect('r.bodySource', 'bodySource')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('r.updatedAt', 'updatedAt')
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(ReviewVote, 'v')
            .where('v.reviewId = r.id'),
        'totalVotes',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COALESCE(SUM(v.vote), 0)')
            .from(ReviewVote, 'v')
            .where('v.reviewId = r.id'),
        'netVotes',
      )
      .leftJoin('r.votes', 'vote')
      .whereInIds(ids)
      .groupBy('r.id')
      .getRawMany();

    const commentsCounts = (await this.commentsService.findCommentsCount(
      CommentEntityType.REVIEW,
      ids,
    )) as {
      entityId: string;
      count: number;
    }[];

    const commentsCountMap = new Map(
      commentsCounts.map((item) => [item.entityId, item.count]),
    );

    return reviews.map((r) => ({
      ...r,
      commentsCount: commentsCountMap.get(r.id) || 0,
    }));
  }

  async reviewVote(reviewId: string, currentUserId: string, vote: VoteType) {
    const rv = new ReviewVote();

    rv.reviewId = reviewId;
    rv.userId = currentUserId;
    rv.vote = vote;

    await this.reviewVoteRepository.save(rv);

    return true;
  }

  async removeReviewVote(reviewId: string, currentUserId: string) {
    const vote = await this.reviewVoteRepository.findOne({
      where: {
        reviewId,
        userId: currentUserId,
      },
    });

    if (!vote) return false;

    await this.reviewVoteRepository.delete({ id: vote.id });

    return true;
  }

  async create(bodySource: string): Promise<Review> {
    const review = new Review();
    review.bodySource = bodySource;
    review.body = await this.entitiesReferenceService.parseLinks(bodySource);
    return review;
  }

  async update(review: Review, bodySource: string): Promise<Review> {
    review.bodySource = bodySource;
    review.body = await this.entitiesReferenceService.parseLinks(bodySource);
    return review;
  }

  async delete(reviewId: string): Promise<void> {
    await this.commentsService.deleteCommentsByEntity(
      CommentEntityType.REVIEW,
      reviewId,
    );
    await this.reviewsRepository.delete({ id: reviewId });
  }
}
