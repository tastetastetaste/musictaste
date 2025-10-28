import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntityType,
  CreateEntryDto,
  EntriesSortByEnum,
  FindEntriesDto,
  IEntriesResponse,
  IEntry,
  IEntryResonse,
  IRelease,
  IReview,
  IUser,
  UpdateEntryDto,
  VoteType,
} from 'shared';
import { In, Repository } from 'typeorm';
import { Rating } from '../../db/entities/rating.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { ReviewVote } from '../../db/entities/review-vote.entity';
import { Review } from '../../db/entities/review.entity';
import { TrackVote } from '../../db/entities/track-vote.entity';
import { Track } from '../../db/entities/track.entity';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { UserReleaseTag } from '../../db/entities/user-release-tag.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { CommentsService } from '../comments/comments.service';
import { ReleasesService } from '../releases/releases.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(UserRelease)
    private userReleaseRepository: Repository<UserRelease>,
    @InjectRepository(Rating) private ratingsRepository: Repository<Rating>,
    @InjectRepository(Review) private reviewsRepository: Repository<Review>,
    @InjectRepository(ReviewVote)
    private reviewVoteRepository: Repository<ReviewVote>,

    @InjectRepository(TrackVote)
    private trackVotesRepository: Repository<TrackVote>,
    @InjectRepository(ReleaseArtist)
    private releaseArtistRepository: Repository<ReleaseArtist>,
    @InjectRepository(ReleaseGenre)
    private releaseGenreRepository: Repository<ReleaseGenre>,
    @InjectRepository(ReleaseLabel)
    private releaseLabelRepository: Repository<ReleaseLabel>,
    @InjectRepository(Track) private tracksRepository: Repository<Track>,
    @InjectRepository(UserReleaseTag)
    private userReleaseTagRepository: Repository<UserReleaseTag>,
    private releasesService: ReleasesService,
    private usersService: UsersService,
    private commentsService: CommentsService,
  ) {}

  async create(
    { releaseId, rating, review, tags }: CreateEntryDto,
    currentUserId: string,
  ) {
    const ur = new UserRelease();
    ur.releaseId = releaseId;
    ur.userId = currentUserId;

    if (rating !== null && rating !== undefined) {
      const _rating = new Rating();
      _rating.rating = rating;
      ur.rating = _rating;
    }

    if (review) {
      const _review = new Review();
      _review.body = review;
      ur.review = _review;
    }

    if (tags && tags.length > 0) {
      const _tags = await this.userReleaseTagRepository.find({
        where: { id: In(tags) },
      });

      ur.tags = _tags;
    }

    const entry = await this.userReleaseRepository.save(ur);

    if (entry.reviewId) {
      this.reviewVote(entry.reviewId, currentUserId, VoteType.UP);
    }

    return true;
  }

  async update(
    id: string,
    { rating, review, tags }: UpdateEntryDto,
    currentUserId: string,
  ) {
    let createReview = false;

    const ur = await this.userReleaseRepository.findOne({
      where: {
        id,
      },
      relations: {
        rating: true,
        review: true,
        tags: true,
      },
    });

    if (!ur) throw new BadRequestException();

    if (ur.userId !== currentUserId) throw new UnauthorizedException();

    if (tags && tags.length > 0) {
      ur.tags = await this.userReleaseTagRepository.find({
        where: { id: In(tags) },
      });
    } else {
      ur.tags = [];
    }

    if (rating !== null && rating !== undefined) {
      if (!ur.ratingId) {
        // create rating
        const _rating = new Rating();
        _rating.rating = rating;
        ur.rating = _rating;
      } else {
        // update rating
        ur.rating.rating = rating;
      }
    } else if (ur.ratingId) {
      // remove rating
      await this.ratingsRepository.delete({ id: ur.ratingId });
      ur.rating = null;
      ur.ratingId = null;
    }

    if (review) {
      if (!ur.reviewId) {
        // create review
        const _review = new Review();
        _review.body = review;
        ur.review = _review;

        createReview = true;
      } else {
        // update review
        ur.review.body = review;
      }
    } else if (ur.reviewId) {
      // remove review
      await this.commentsService.deleteCommentsByEntity(
        CommentEntityType.REVIEW,
        ur.reviewId,
      );
      await this.reviewsRepository.delete({ id: ur.reviewId });
      ur.review = null;
      ur.reviewId = null;
    }

    const entry = await this.userReleaseRepository.save(ur);

    if (createReview && entry.reviewId) {
      this.reviewVote(entry.reviewId, currentUserId, VoteType.UP);
    }

    return true;
  }

  async remove(id: string, currentUserId: string) {
    const ur = await this.userReleaseRepository.findOne({ where: { id } });

    if (ur.userId !== currentUserId) throw new UnauthorizedException();

    // Delete review comments
    if (ur.reviewId) {
      await this.commentsService.deleteCommentsByEntity(
        CommentEntityType.REVIEW,
        ur.reviewId,
      );
    }

    await this.userReleaseRepository.remove(ur);

    return true;
  }

  async findOne(
    where: {
      id?: string;
      releaseId?: string;
      userId?: string;
    },
    currentUserId?: string,
  ): Promise<IEntryResonse> {
    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rating', 'rating')
      .leftJoinAndSelect('ur.tags', 'tags')
      .leftJoinAndSelect('ur.trackVotes', 'vote')
      .leftJoinAndSelect('vote.track', 'track');

    if (where.id) {
      urQB.where('ur.id = :id', { id: where.id });
    } else {
      urQB
        .where('ur.userId = :userId')
        .andWhere('ur.releaseId = :releaseId')
        .setParameters({ userId: where.userId, releaseId: where.releaseId });
    }

    const ur = await urQB.getOne();

    if (!ur) {
      return null;
    }

    const [[release], user, reviews] = await Promise.all([
      this.releasesService.getReleasesByIds([ur.releaseId]),
      this.usersService.getUserById(ur.userId),
      ur.reviewId
        ? this.getReviewsByIds([ur.reviewId], currentUserId)
        : Promise.resolve([]),
    ]);

    const entry = this.mapEntry({
      ur,
      reviews,
      users: [user],
      releases: [release],
    });

    return {
      entry,
    };
  }
  async find(
    params: FindEntriesDto,
    currentUserId?: string,
  ): Promise<IEntriesResponse> {
    const {
      releaseId,
      userId,
      withReview,
      sortBy,
      year,
      decade,
      bucket,
      genre,
      artist,
      label,
      tag,
      type,
      page,
      pageSize,
    } = params;

    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rating', 'rating');

    if (userId) {
      urQB.where('ur.userId = :userId', { userId });
    } else if (releaseId) {
      urQB.where('ur.releaseId = :releaseId', { releaseId });
    }

    if (
      year ||
      decade ||
      sortBy === EntriesSortByEnum.ReleaseDate ||
      type !== undefined
    ) {
      urQB.leftJoin('ur.release', 'release');
    }

    if (year) {
      urQB.andWhere(`EXTRACT(YEAR FROM release.date) = :year`, { year });
    }

    if (decade) {
      urQB.andWhere(`EXTRACT(DECADE FROM release.date) = :decade`, {
        decade,
      });
    }

    if (type !== undefined) {
      urQB.andWhere('release.type = :type', { type });
    }

    if (
      sortBy === EntriesSortByEnum.ReviewDate ||
      sortBy === EntriesSortByEnum.ReviewTop
    ) {
      urQB.innerJoin('ur.review', 'review');

      if (sortBy === EntriesSortByEnum.ReviewTop)
        urQB.leftJoin('review.votes', 'votes');

      if (!userId && !releaseId)
        urQB.where("review.createdAt >= current_date - interval '72 hours'");
    }

    if (genre) {
      urQB
        .leftJoin(
          ReleaseGenre,
          'rg',
          'rg.releaseId = ur.releaseId AND rg.votesAvg > 0.5',
        )
        .andWhere('rg.genreId = :genreId', { genreId: genre });
    }

    if (artist) {
      urQB
        .leftJoin(ReleaseArtist, 'ra', 'ra.releaseId = ur.releaseId')
        .andWhere('ra.artistId = :artistId', { artistId: artist });
    }

    if (label) {
      urQB
        .leftJoin(ReleaseLabel, 'rl', 'rl.releaseId = ur.releaseId')
        .andWhere('rl.labelId = :labelId', { labelId: label });
    }

    if (tag) {
      urQB
        .leftJoin('ur.tags', 'tags')
        .andWhere('tags.id = :tagId', { tagId: tag });
    }

    if (bucket) {
      const buckets = [
        { bucket: '1', start: 0, end: 9 },
        { bucket: '2', start: 10, end: 19 },
        { bucket: '3', start: 20, end: 29 },
        { bucket: '4', start: 30, end: 39 },
        { bucket: '5', start: 40, end: 49 },
        { bucket: '6', start: 50, end: 59 },
        { bucket: '7', start: 60, end: 69 },
        { bucket: '8', start: 70, end: 79 },
        { bucket: '9', start: 80, end: 89 },
        { bucket: '10', start: 90, end: 99 },
        { bucket: '11', is: 100 },
        { bucket: '-1', is: -1 },
      ];

      const start = buckets.find((b) => b.bucket === bucket)?.start;
      const end = buckets.find((b) => b.bucket === bucket)?.end;

      const is = buckets.find((b) => b.bucket === bucket)?.is;

      if (typeof start === 'number' && typeof end === 'number') {
        urQB.andWhere('rating.rating BETWEEN :start AND :end', {
          start,
          end,
        });
      }
      if (typeof is === 'number') {
        if (is === 100) {
          urQB.andWhere('rating.rating = :is', {
            is,
          });
        } else {
          // -1
          urQB.andWhere('rating.rating is null');
        }
      }
    }

    // --- sort by

    switch (sortBy) {
      case EntriesSortByEnum.RatingDate:
        urQB.orderBy('rating.updatedAt', 'DESC', 'NULLS LAST');

        break;

      case EntriesSortByEnum.RatingHighToLow:
        urQB
          .orderBy('rating.rating', 'DESC', 'NULLS LAST')
          .addOrderBy('rating.updatedAt', 'DESC');
        break;

      case EntriesSortByEnum.RatingLowToHigh:
        urQB
          .orderBy('rating.rating', 'ASC', 'NULLS LAST')
          .addOrderBy('rating.updatedAt', 'DESC');

        break;

      case EntriesSortByEnum.ReleaseDate:
        urQB.orderBy('release.date', 'DESC').addOrderBy('release.id', 'ASC');

        break;

      case EntriesSortByEnum.EntryDate:
        urQB.orderBy('ur.createdAt', 'DESC');

        break;

      case EntriesSortByEnum.ReviewDate:
        urQB.orderBy('review.createdAt', 'DESC');

        break;

      case EntriesSortByEnum.ReviewTop:
        urQB
          .orderBy('SUM(votes.vote)', 'DESC', 'NULLS LAST')
          .groupBy('ur.id')
          .addGroupBy('rating.id');

        break;

      default:
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
      withReview
        ? this.getReviewsByIds(
            result.map((ur) => ur.reviewId),
            currentUserId,
          )
        : Promise.resolve(null),
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
      entries: result.map((ur) =>
        this.mapEntry({ ur, reviews, releases, users }),
      ),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + result.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
  async findReleaseFollowingEntries(
    releaseId: string,
    userId: string,
  ): Promise<Pick<IEntry, 'rating' | 'user'>[]> {
    const result = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rating', 'rating')
      .leftJoinAndSelect('ur.tags', 'tags')
      .where('ur.releaseId = :releaseId', { releaseId: releaseId })
      .andWhere(
        (qb) => {
          const subQuery = qb
            .subQuery()
            .select('uf.followingId', 'id')
            .where('uf.followerId = :userId')
            .from(UserFollowing, 'uf')
            .getQuery();

          return 'ur.userId IN ' + subQuery;
        },
        { userId },
      )
      .orderBy('ur.createdAt', 'DESC')
      .getMany();

    const users = await this.usersService.getUsersByIds(
      result.map((i) => i.userId),
    );

    return result.map((ur) => ({
      ...ur,
      user: users.find((u) => u.id === ur.userId),
    }));
  }

  private mapEntry({
    ur,
    reviews,
    releases,
    users,
  }: {
    ur?: UserRelease;
    reviews?: IReview[];
    releases?: IRelease[] | null;
    users?: IUser[] | null;
  }): IEntry {
    const review = reviews?.find((r) => r.id === ur.reviewId);
    const release = releases
      ? releases.find((r) => r.id === ur.releaseId)
      : null;
    const user = users ? users.find((u) => u.id === ur.userId) : null;

    return {
      ...ur,
      release,
      user,
      review,
    };
  }
  // --- TAGS
  async createTag(tag: string, userId: string): Promise<UserReleaseTag> {
    const newTag = new UserReleaseTag();
    newTag.tag = tag;
    newTag.userId = userId;

    return this.userReleaseTagRepository.save(newTag);
  }

  async updateTag(id: string, tag: string, userId: string): Promise<void> {
    const tagToUpdate = await this.userReleaseTagRepository.findOne({
      where: { id },
    });
    if (!tagToUpdate) {
      throw new BadRequestException();
    }

    if (tagToUpdate.userId !== userId) throw new UnauthorizedException();

    tagToUpdate.tag = tag;

    await this.userReleaseTagRepository.save(tagToUpdate);
  }

  async deleteTag(id: string, userId: string): Promise<void> {
    const tagToDelete = await this.userReleaseTagRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.entries', 'entries')
      .leftJoinAndSelect('entries.tags', 'tags')
      .where('t.id = :id', { id })
      .getOne();

    if (!tagToDelete) {
      throw new BadRequestException();
    }

    if (tagToDelete.userId !== userId) throw new UnauthorizedException();

    tagToDelete.entries.forEach((userRelease) => {
      userRelease.tags = userRelease.tags.filter((tag) => tag.id !== id);
    });

    await this.userReleaseRepository.save(tagToDelete.entries);
    await this.userReleaseTagRepository.delete(id);
  }

  // ---- REVIEWS

  private async getReviewsByIds(
    ids: string[],
    currentUserId: string,
  ): Promise<IReview[]> {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('r')
      .select('r.id', 'id')
      .addSelect('r.body', 'body')
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

    const [votes, commentsCounts] = await Promise.all([
      this.reviewVoteRepository.find({
        where: {
          reviewId: In(ids),
          userId: currentUserId,
        },
      }),
      this.commentsService.findCommentsCount(
        CommentEntityType.REVIEW,
        ids,
      ) as any,
    ]);

    const commentsCountMap = new Map(
      commentsCounts.map((item) => [item.entityId, item.count]),
    );

    return reviews.map((r) => ({
      ...r,
      userVote: votes.find((v) => v.reviewId === r.id)?.vote,
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

    await this.reviewVoteRepository.delete({ id: vote.id });

    return true;
  }

  // --- Track votes

  async trackVote(
    {
      releaseId,
      trackId,
      vote,
    }: {
      releaseId: string;
      trackId: string;
      vote: VoteType;
    },
    userId: string,
  ) {
    if (!userId) throw new BadRequestException();

    const ur = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .select(['ur.id', 'ur.hasTrackVotes'])
      .where('ur.userId = :userId')
      .andWhere('ur.releaseId = :releaseId')
      .setParameters({ userId, releaseId })
      .getOne();

    if (!ur) throw new BadRequestException();

    let trackVote = await this.trackVotesRepository
      .createQueryBuilder('vote')
      .where('vote.userReleaseId = :userReleaseId')
      .andWhere('vote.trackId = :trackId')
      .setParameters({ userReleaseId: ur.id, trackId })
      .getOne();

    if (trackVote) {
      // update
      await this.trackVotesRepository.update({ id: trackVote.id }, { vote });
    } else {
      // create
      const _tr = new TrackVote();
      _tr.trackId = trackId;
      _tr.userReleaseId = ur.id;
      _tr.vote = vote;
      trackVote = await this.trackVotesRepository.save(_tr);
    }

    if (!ur.hasTrackVotes) {
      this.userReleaseRepository.update(
        {
          releaseId,
          userId,
        },
        {
          hasTrackVotes: true,
        },
      );
    }

    return trackVote;
  }
  async removeTrackVote(
    {
      releaseId,
      trackId,
    }: {
      releaseId: string;
      trackId: string;
    },
    userId: string,
  ) {
    if (!userId) return null;

    const ur = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .select('ur.id', 'id')
      .addSelect('COUNT(votes)', 'votesCount')
      .where('ur.userId = :userId')
      .andWhere('ur.releaseId = :releaseId')
      .leftJoin('ur.trackVotes', 'votes')
      .setParameters({ userId, releaseId })
      .groupBy('ur.id')
      .getRawOne();

    if (!ur) return null;

    await this.trackVotesRepository.delete({
      userReleaseId: ur.id,
      trackId,
    });

    if (ur.votesCount === 1) {
      await this.userReleaseRepository.update(
        {
          id: ur.id,
        },
        {
          hasTrackVotes: false,
        },
      );
    }

    return true;
  }

  async userEntriesArtists(userId: string) {
    const artists = await this.releaseArtistRepository
      .createQueryBuilder('ra')
      .select('artist.id', 'artistId')
      .addSelect('artist.name', 'artistName')
      .addSelect('artist.nameLatin', 'artistNameLatin')
      .addSelect('COUNT(artist.id)::int', 'artistCount')

      .innerJoin(
        UserRelease,
        'ur',
        'ur.userId = :userId AND ur.releaseId = ra.releaseId',
        { userId },
      )
      .leftJoin('ra.artist', 'artist')
      .orderBy('COUNT(artist.id)', 'DESC')
      .groupBy('artist.id')
      .getRawMany();

    const result = artists.map((ua) => ({
      id: ua.artistId,
      name: ua.artistName,
      nameLatin: ua.artistNameLatin,
      count: ua.artistCount,
    }));

    return result;
  }
  async userEntriesRatings(userId) {
    const result = await this.userReleaseRepository.query(
      `
      SELECT
        COUNT(*)::int as "count",
        CASE
          WHEN rating.rating BETWEEN 0 AND 9 THEN 1
          WHEN rating.rating BETWEEN 10 AND 19 THEN 2
          WHEN rating.rating BETWEEN 20 AND 29 THEN 3
          WHEN rating.rating BETWEEN 30 AND 39 THEN 4
          WHEN rating.rating BETWEEN 40 AND 49 THEN 5
          WHEN rating.rating BETWEEN 50 AND 59 THEN 6
          WHEN rating.rating BETWEEN 60 AND 69 THEN 7
          WHEN rating.rating BETWEEN 70 AND 79 THEN 8
          WHEN rating.rating BETWEEN 80 AND 89 THEN 9
          WHEN rating.rating BETWEEN 90 AND 99 THEN 10
          WHEN rating.rating BETWEEN 100 AND 100 THEN 11
          ELSE -1
        END AS "bucket"
        FROM "user_release" "ur" LEFT JOIN "rating" "rating" ON "rating"."id"="ur"."ratingId" WHERE "ur"."userId" = $1 GROUP BY bucket;
      `,
      [userId],
    );

    return result;
  }
  async userEntriesGenres(userId) {
    const genres = await this.releaseGenreRepository
      .createQueryBuilder('rg')
      .select('genre.id', 'genreId')
      .addSelect('genre.name', 'genreName')
      .addSelect('COUNT(genre.id)::int', 'genreCount')
      .where('rg.votesAvg > 0.5')
      .innerJoin(
        UserRelease,
        'ur',
        'ur.userId = :userId AND ur.releaseId = rg.releaseId',
        { userId },
      )
      .leftJoin('rg.genre', 'genre')
      .orderBy('COUNT(genre.id)', 'DESC')
      .groupBy('genre.id')
      .getRawMany();

    const result = genres.map((ug) => ({
      id: ug.genreId,
      name: ug.genreName,
      count: ug.genreCount,
    }));

    return result;
  }
  async userEntriesLabels(userId) {
    const labels = await this.releaseLabelRepository
      .createQueryBuilder('rl')
      .select('label.id', 'labelId')
      .addSelect('label.name', 'labelName')
      .addSelect('COUNT(label.id)::int', 'labelCount')
      .innerJoin(
        UserRelease,
        'ur',
        'ur.userId = :userId AND ur.releaseId = rl.releaseId',
        { userId },
      )
      .leftJoin('rl.label', 'label')
      .orderBy('COUNT(label.id)', 'DESC')
      .groupBy('label.id')
      .getRawMany();

    const result = labels.map((ul) => ({
      id: ul.labelId,
      name: ul.labelName,
      count: ul.labelCount,
    }));

    return result;
  }
  async userEntriesReleaseDate(userId) {
    const result = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .where('ur.userId = :userId', { userId })
      .select('EXTRACT(DECADE FROM release.date)', 'decade')
      .addSelect('EXTRACT(YEAR FROM release.date)', 'year')
      .addSelect('COUNT(*)::int')
      .innerJoin('ur.release', 'release', 'release.date is not null')
      .groupBy('decade')
      .addGroupBy('year')
      .orderBy('year', 'DESC')
      .getRawMany();

    return result;
  }
  async userEntriesTags(userId) {
    const tags = await this.userReleaseTagRepository
      .createQueryBuilder('t')
      .select('t.id', 'id')
      .addSelect('t.userId', 'userId')
      .addSelect('t.tag', 'tag')
      .addSelect('count(e)::int', 'count')
      .where('t.userId = :userId', { userId })
      .leftJoin('t.entries', 'e')
      .groupBy('t.id')
      .getRawMany();

    return tags;
  }
}
