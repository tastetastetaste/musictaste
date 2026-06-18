import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateEntryDto,
  EntriesSortByEnum,
  FindEntriesDto,
  IEntriesResponse,
  IEntry,
  IEntryResonse,
  UpdateEntryDto,
  VoteType,
} from 'shared';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Rating } from '../../db/entities/rating.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { TrackVote } from '../../db/entities/track-vote.entity';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { UserReleaseTag } from '../../db/entities/user-release-tag.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { ReleasesService } from '../releases/releases.service';
import { UsersService } from '../users/users.service';
import { mapEntries } from './entries.utils';
import { ReviewsService } from './reviews.service';
import dayjs from 'dayjs';

enum RatingFilterEnum {
  is = 'is',
  isnot = 'is not',
  isgreaterthan = 'is greater than',
  islessthan = 'is less than',
  inrange = 'in range',
  hasavalue = 'has a value',
  hasnovalue = 'has no value',
}

enum YearFilterEnum {
  is = 'is',
  isafter = 'is after',
  isbefore = 'is before',
  inrange = 'in range',
}

enum MultiValueFilterEnum {
  isanyof = 'is any of',
  isnotanyof = 'is not any of',
}

class UserCollectionViewFilters {
  rating?: RatingFilterEnum;
  ratingIs?: number; // is, isnot
  ratingStart?: number; // isgreaterthan, inrange
  ratingEnd?: number; // islessthan, inrange

  year?: YearFilterEnum;
  yearIs?: string;
  yearStart?: string; // isafter, inrange
  yearEnd?: string; // isbefore, in range

  type?: MultiValueFilterEnum;
  typeValues?: number[]; // isanyof, isnotanyof

  artist?: MultiValueFilterEnum;
  artistValues?: string[];

  genre?: MultiValueFilterEnum;
  genreValues?: string[];

  label?: MultiValueFilterEnum;
  labelValues?: string[];

  country?: MultiValueFilterEnum;
  countryValues?: string[];

  tag?: MultiValueFilterEnum;
  tagValues?: string[];
}

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(UserRelease)
    private userReleaseRepository: Repository<UserRelease>,
    @InjectRepository(Rating) private ratingsRepository: Repository<Rating>,
    @InjectRepository(TrackVote)
    private trackVotesRepository: Repository<TrackVote>,
    @InjectRepository(ReleaseArtist)
    private releaseArtistRepository: Repository<ReleaseArtist>,
    @InjectRepository(ReleaseGenre)
    private releaseGenreRepository: Repository<ReleaseGenre>,
    @InjectRepository(ReleaseLabel)
    private releaseLabelRepository: Repository<ReleaseLabel>,
    @InjectRepository(UserReleaseTag)
    private userReleaseTagRepository: Repository<UserReleaseTag>,
    private releasesService: ReleasesService,
    private usersService: UsersService,
    private reviewsService: ReviewsService,
  ) {}

  async create(
    { releaseId, rating, review, tags }: CreateEntryDto,
    currentUserId: string,
  ) {
    const ur = new UserRelease();
    ur.releaseId = releaseId;
    ur.userId = currentUserId;

    if (review) {
      ur.review = await this.reviewsService.create(review);
    }

    if (rating !== null && rating !== undefined) {
      const _rating = new Rating();
      _rating.rating = rating;
      ur.rating = _rating;
    }

    if (tags && tags.length > 0) {
      const _tags = await this.userReleaseTagRepository.find({
        where: { id: In(tags) },
      });

      ur.tags = _tags;
    }

    const entry = await this.userReleaseRepository.save(ur);

    if (entry.reviewId) {
      await this.reviewsService.reviewVote(
        entry.reviewId,
        currentUserId,
        VoteType.UP,
      );
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
        ur.review = await this.reviewsService.create(review);

        createReview = true;
      } else {
        // update review
        ur.review = await this.reviewsService.update(ur.review, review);
      }
    } else if (ur.reviewId) {
      // remove review
      await this.reviewsService.delete(ur.reviewId);
      ur.review = null;
      ur.reviewId = null;
    }

    const entry = await this.userReleaseRepository.save(ur);

    if (createReview && entry.reviewId) {
      await this.reviewsService.reviewVote(
        entry.reviewId,
        currentUserId,
        VoteType.UP,
      );
    }

    return true;
  }

  async remove(id: string, currentUserId: string) {
    const ur = await this.userReleaseRepository.findOne({ where: { id } });
    if (!ur) throw new BadRequestException();
    if (ur.userId !== currentUserId) throw new UnauthorizedException();

    // Delete review
    if (ur.reviewId) {
      await this.reviewsService.delete(ur.reviewId);
    }

    await this.userReleaseRepository.remove(ur);

    return true;
  }

  async findOne(where: {
    id?: string;
    releaseId?: string;
    userId?: string;
  }): Promise<IEntryResonse> {
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
      return {
        entry: null,
      };
    }

    const [[release], user, review] = await Promise.all([
      this.releasesService.getReleasesByIds([ur.releaseId]),
      this.usersService.getUserById(ur.userId),
      ur.reviewId
        ? this.reviewsService.getReviewSummary(ur.reviewId)
        : Promise.resolve(null),
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

  private async applyFilters(
    urQB: SelectQueryBuilder<UserRelease>,
    filters: UserCollectionViewFilters,
    sortBy?: EntriesSortByEnum,
    skipJoins?: { skipRatingJoin?: boolean },
  ) {
    let needRatingJoin = false;
    let needReleaseJoin = false;
    let needReleaseArtistJoin = false;

    if (filters.rating) {
      if (
        [
          RatingFilterEnum.is,
          RatingFilterEnum.isnot,
          RatingFilterEnum.isgreaterthan,
          RatingFilterEnum.islessthan,
          RatingFilterEnum.inrange,
        ].includes(filters.rating)
      )
        needRatingJoin = true;

      if (filters.rating === RatingFilterEnum.hasavalue)
        urQB.andWhere('ur.ratingId IS NOT NULL');
      else if (filters.rating === RatingFilterEnum.hasnovalue)
        urQB.andWhere('ur.ratingId IS NULL');
      else if (
        filters.rating === RatingFilterEnum.is &&
        typeof filters.ratingIs === 'number'
      )
        urQB.andWhere('rating.rating = :rating', { rating: filters.ratingIs });
      else if (
        filters.rating === RatingFilterEnum.isnot &&
        typeof filters.ratingIs === 'number'
      )
        urQB.andWhere('rating.rating <> :rating', { rating: filters.ratingIs });
      else if (
        filters.rating === RatingFilterEnum.isgreaterthan &&
        typeof filters.ratingStart === 'number'
      )
        urQB.andWhere('rating.rating > :rating', {
          rating: filters.ratingStart,
        });
      else if (
        filters.rating === RatingFilterEnum.islessthan &&
        typeof filters.ratingEnd === 'number'
      )
        urQB.andWhere('rating.rating < :rating', { rating: filters.ratingEnd });
      else if (
        filters.rating === RatingFilterEnum.inrange &&
        typeof filters.ratingStart === 'number' &&
        typeof filters.ratingEnd === 'number'
      )
        urQB.andWhere('rating.rating BETWEEN :ratingStart AND :ratingEnd', {
          ratingStart: filters.ratingStart,
          ratingEnd: filters.ratingEnd,
        });
    }

    if (filters.year) {
      needReleaseJoin = true;

      let startDate;
      let endDate;

      const formatDate = (djs: dayjs.Dayjs) => djs.format('YYYY-MM-DD');

      if (filters.year === YearFilterEnum.is && filters.yearIs) {
        // 2026 -> [2026-01-01 to 2027-01-01)
        startDate = formatDate(dayjs(filters.yearIs, 'YYYY').startOf('year'));
        endDate = formatDate(
          dayjs(filters.yearIs, 'YYYY').add(1, 'year').startOf('year'),
        );
      } else if (filters.year === YearFilterEnum.isafter && filters.yearStart) {
        startDate = formatDate(
          dayjs(filters.yearStart, 'YYYY').add(1, 'year').startOf('year'),
        );
      } else if (filters.year === YearFilterEnum.isbefore && filters.yearEnd) {
        endDate = formatDate(dayjs(filters.yearEnd, 'YYYY').startOf('year'));
      } else if (
        filters.year === YearFilterEnum.inrange &&
        filters.yearStart &&
        filters.yearEnd
      ) {
        // 2020 to 2024 -> [2020-01-01 to 2025-01-01)
        startDate = formatDate(
          dayjs(filters.yearStart, 'YYYY').startOf('year'),
        );
        endDate = formatDate(
          dayjs(filters.yearEnd, 'YYYY').add(1, 'year').startOf('year'),
        );
      }

      if (startDate) {
        urQB.andWhere('release.date >= :startDate', { startDate });
      }
      if (endDate) {
        urQB.andWhere('release.date < :endDate', { endDate });
      }
    }

    if (filters.type && filters.typeValues?.length) {
      needReleaseJoin = true;

      if (filters.type === MultiValueFilterEnum.isanyof)
        urQB.andWhere('release.type IN (:...typeValues)', {
          typeValues: filters.typeValues,
        });
      else if (filters.type === MultiValueFilterEnum.isnotanyof)
        urQB.andWhere('release.type NOT IN (:...typeValues)', {
          typeValues: filters.typeValues,
        });
    }

    if (filters.artist && filters.artistValues?.length) {
      if (filters.artist === MultiValueFilterEnum.isanyof) {
        needReleaseArtistJoin = true;
        urQB.andWhere('ra.artistId IN (:...artistValues)', {
          artistValues: filters.artistValues,
        });
      } else if (filters.artist === MultiValueFilterEnum.isnotanyof)
        urQB
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from(ReleaseArtist, 'subra')
              .where('subra.releaseId = ur.releaseId')
              .andWhere('subra.artistId IN (:...artistValues)')
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          })
          .setParameter('artistValues', filters.artistValues);
    }

    if (filters.genre && filters.genreValues?.length) {
      if (filters.genre === MultiValueFilterEnum.isanyof)
        urQB
          .innerJoin(ReleaseGenre, 'rg', 'rg.releaseId = ur.releaseId')
          .andWhere('rg.votesAvg > 0.5')
          .andWhere('rg.genreId IN (:...genreValues)', {
            genreValues: filters.genreValues,
          });
      else if (filters.genre === MultiValueFilterEnum.isnotanyof)
        urQB
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from(ReleaseGenre, 'subrg')
              .where('subrg.releaseId = ur.releaseId')
              .andWhere('subrg.votesAvg > 0.5')
              .andWhere('subrg.genreId IN (:...genreValues)')
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          })
          .setParameter('genreValues', filters.genreValues);
    }

    if (filters.label && filters.labelValues?.length) {
      if (filters.label === MultiValueFilterEnum.isanyof)
        urQB
          .innerJoin(ReleaseLabel, 'rl', 'rl.releaseId = ur.releaseId')
          .andWhere('rl.labelId IN (:...labelValues)', {
            labelValues: filters.labelValues,
          });
      else if (filters.label === MultiValueFilterEnum.isnotanyof)
        urQB
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from(ReleaseLabel, 'subrl')
              .where('subrl.releaseId = ur.releaseId')
              .andWhere('subrl.labelId IN (:...labelValues)')
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          })
          .setParameter('labelValues', filters.labelValues);
    }

    if (filters.country && filters.countryValues?.length) {
      if (filters.country === MultiValueFilterEnum.isanyof) {
        needReleaseArtistJoin = true;
        urQB
          .innerJoin('ra.artist', 'artist')
          .andWhere('artist.countryId IN (:...countryValues)', {
            countryValues: filters.countryValues,
          });
      } else if (filters.country === MultiValueFilterEnum.isnotanyof)
        urQB
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from(ReleaseArtist, 'subra')
              .innerJoin('subra.artist', 'subartist')
              .where('subra.releaseId = ur.releaseId')
              .andWhere('subartist.countryId IN (:...countryValues)')
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          })
          .setParameter('countryValues', filters.countryValues);
    }

    if (filters.tag && filters.tagValues?.length) {
      if (filters.tag === MultiValueFilterEnum.isanyof)
        urQB.innerJoin('ur.tags', 'tag').andWhere('tag.id IN (:...tagValues)', {
          tagValues: filters.tagValues,
        });
      else if (filters.tag === MultiValueFilterEnum.isnotanyof)
        urQB
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from('user_release_user_tag', 'suburt')
              .where('sub_urt.user_release_id = ur.id')
              .andWhere('sub_urt.user_release_tag_id IN (:...tagValues)')
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          })
          .setParameter('tagValues', filters.tagValues);
    }

    // sort by
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
        needReleaseJoin = true;
        urQB.orderBy('release.date', 'DESC').addOrderBy('release.id', 'ASC');

        break;

      case EntriesSortByEnum.EntryDate:
        urQB.orderBy('ur.createdAt', 'DESC');

        break;

      default:
        break;
    }

    // joins

    if (needRatingJoin && !skipJoins?.skipRatingJoin)
      urQB.leftJoin('ur.rating', 'rating');

    if (needReleaseJoin) urQB.innerJoin('ur.release', 'release');

    if (needReleaseArtistJoin)
      urQB.innerJoin(ReleaseArtist, 'ra', 'ra.releaseId = ur.releaseId');
  }

  async find(params: FindEntriesDto): Promise<IEntriesResponse> {
    const {
      releaseId,
      userId,
      sortBy,
      year,
      decade,
      bucket,
      genres,
      artists,
      labels,
      tags,
      types,
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

    this.applyFilters(
      urQB,
      {
        year: year
          ? YearFilterEnum.is
          : decade
            ? YearFilterEnum.inrange
            : undefined,
        yearIs: year,
        yearStart: decade ? dayjs(decade, 'YYYY').format('YYYY') : undefined,
        yearEnd: decade
          ? dayjs(decade, 'YYYY').add(9, 'year').format('YYYY')
          : undefined,
        type: types?.length ? MultiValueFilterEnum.isanyof : undefined,
        typeValues: types,
        genre: genres?.length ? MultiValueFilterEnum.isanyof : undefined,
        genreValues: genres,
        artist: artists?.length ? MultiValueFilterEnum.isanyof : undefined,
        artistValues: artists,
        label: labels?.length ? MultiValueFilterEnum.isanyof : undefined,
        labelValues: labels,
        tag: tags?.length ? MultiValueFilterEnum.isanyof : undefined,
        tagValues: tags,

        rating:
          bucket === '-1'
            ? RatingFilterEnum.hasnovalue
            : bucket === '11'
              ? RatingFilterEnum.is
              : bucket
                ? RatingFilterEnum.inrange
                : undefined,
        ratingIs: bucket === '11' ? 100 : undefined,
        /*
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
      */
        ratingStart: bucket ? Number(`${bucket}0`) - 10 : undefined,
        ratingEnd: bucket ? Number(`${bucket}0`) - 1 : undefined,
      },
      sortBy,
      { skipRatingJoin: true },
    );

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

    const [releases, users] = await Promise.all([
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
      entries: mapEntries(result, { releases, users }),
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

    return mapEntries(result, { users });
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
