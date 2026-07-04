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
  RatingFilterEnum,
  YearFilterEnum,
  MultiValueFilterEnum,
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
import {
  UserCollectionViewFilters,
  UserCollectionView,
} from '../../db/entities/user-collection-view';

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
    @InjectRepository(UserCollectionView)
    private userCollectionViewRepository: Repository<UserCollectionView>,
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
              .from('user_release_user_tag', 'sub_urt')
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
      collectionViewId,
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

    const emptyResponse = {
      entries: [],
      totalItems: 0,
      currentPage: page,
      currentItems: (page - 1) * pageSize,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(0 / pageSize),
    };

    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rating', 'rating');

    if (userId) {
      urQB.where('ur.userId = :userId', { userId });
    } else if (releaseId) {
      urQB.where('ur.releaseId = :releaseId', { releaseId });
    }

    let filters: UserCollectionViewFilters = {};

    if (collectionViewId && userId) {
      const cv = await this.userCollectionViewRepository.findOne({
        where: { id: collectionViewId, userId },
      });
      if (cv) {
        filters = cv.filters;
      }
    }

    let yearFilters = {};

    if (year || filters.year === YearFilterEnum.is) {
      yearFilters = {
        year: YearFilterEnum.is,
        yearIs: year || filters.yearIs,
      };
    } else if (decade || filters.year) {
      const yearRangeMin =
        filters.year === YearFilterEnum.isafter
          ? decade
            ? (+filters.yearStart + 1).toString() // using decade (range) add 1 to exclude the yearStart
            : filters.yearStart
          : filters.year === YearFilterEnum.inrange
            ? filters.yearStart
            : undefined;
      const yearRangeMax =
        filters.year === YearFilterEnum.isbefore
          ? decade
            ? (+filters.yearEnd - 1).toString() // using decade (range) subtract 1 to exclude the yearEnd
            : filters.yearEnd
          : filters.year === YearFilterEnum.inrange
            ? filters.yearEnd
            : undefined;

      const decadeYearStart = decade
        ? dayjs(decade, 'YYYY').format('YYYY')
        : undefined;
      const decadeYearEnd = decade
        ? dayjs(decade, 'YYYY').add(9, 'year').format('YYYY')
        : undefined;

      let yearStart;
      if (decadeYearStart && yearRangeMin) {
        yearStart = Math.max(...[+decadeYearStart, +yearRangeMin]).toString();
      } else {
        yearStart = decadeYearStart || yearRangeMin;
      }

      let yearEnd;
      if (decadeYearEnd && yearRangeMax) {
        yearEnd = Math.min(...[+decadeYearEnd, +yearRangeMax]).toString();
      } else {
        yearEnd = decadeYearEnd || yearRangeMax;
      }

      yearFilters = {
        year: decade ? YearFilterEnum.inrange : filters.year,
        yearStart,
        yearEnd,
      };
    }

    let ratingFilter: any = {};
    const viewRatingHasNoValue = filters.rating === RatingFilterEnum.hasnovalue;
    const bucketRatingHasNoValue = bucket === '-1';
    // Handle no ratings filter
    if (
      filters.rating &&
      bucket &&
      viewRatingHasNoValue !== bucketRatingHasNoValue
    ) {
      return emptyResponse; // disjoint
    }
    if (viewRatingHasNoValue || bucketRatingHasNoValue) {
      ratingFilter = { rating: RatingFilterEnum.hasnovalue };
    } else if (filters.rating || bucket) {
      // View rating filter
      let vMin = 0;
      let vMax = 100;
      if (filters.rating === RatingFilterEnum.is) {
        vMin = filters.ratingIs;
        vMax = filters.ratingIs;
      } else if (filters.rating === RatingFilterEnum.isgreaterthan) {
        vMin = filters.ratingStart + 1;
      } else if (filters.rating === RatingFilterEnum.islessthan) {
        vMax = filters.ratingEnd - 1;
      } else if (filters.rating === RatingFilterEnum.inrange) {
        vMin = filters.ratingStart;
        vMax = filters.ratingEnd;
      }
      // Bucket rating filter
      let bMin = 0;
      let bMax = 100;
      if (bucket === '11') {
        bMin = 100;
        bMax = 100;
      } else if (bucket) {
        const b = Number(bucket);
        bMin = b * 10 - 10;
        bMax = b * 10 - 1;
      }

      // Intersection range
      const min = Math.max(vMin, bMin);
      const max = Math.min(vMax, bMax);
      if (Number.isNaN(min) || Number.isNaN(max)) {
        return emptyResponse;
      }
      if (min > max) {
        return emptyResponse; // disjoint
      }

      ratingFilter = {
        rating: min === max ? RatingFilterEnum.is : RatingFilterEnum.inrange,
        ratingIs: min === max ? min : undefined,
        ratingStart: min === max ? undefined : min,
        ratingEnd: min === max ? undefined : max,
      };
    }

    const intersect = <T>(
      params: T[] | undefined,
      viewOp: MultiValueFilterEnum | undefined,
      viewValues: T[] | undefined,
    ) => {
      if (!params?.length) return { op: viewOp, values: viewValues };
      if (!viewValues?.length)
        return { op: MultiValueFilterEnum.isanyof, values: params };
      const values =
        viewOp === MultiValueFilterEnum.isnotanyof
          ? params.filter((v) => !viewValues.includes(v))
          : params.filter((v) => viewValues.includes(v));
      return {
        op: MultiValueFilterEnum.isanyof,
        values,
        isDisjoint: values.length === 0,
      };
    };

    const typeFilter = intersect(types, filters.type, filters.typeValues);
    const genreFilter = intersect(genres, filters.genre, filters.genreValues);
    const artistFilter = intersect(
      artists,
      filters.artist,
      filters.artistValues,
    );
    const labelFilter = intersect(labels, filters.label, filters.labelValues);
    const tagFilter = intersect(tags, filters.tag, filters.tagValues);

    if (
      typeFilter.isDisjoint ||
      genreFilter.isDisjoint ||
      artistFilter.isDisjoint ||
      labelFilter.isDisjoint ||
      tagFilter.isDisjoint
    )
      return emptyResponse;

    this.applyFilters(
      urQB,
      {
        ...yearFilters,
        ...ratingFilter,

        type: typeFilter.op,
        typeValues: typeFilter.values,

        genre: genreFilter.op,
        genreValues: genreFilter.values,

        artist: artistFilter.op,
        artistValues: artistFilter.values,

        label: labelFilter.op,
        labelValues: labelFilter.values,

        tag: tagFilter.op,
        tagValues: tagFilter.values,

        country: filters.country,
        countryValues: filters.countryValues,
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

  async userEntriesArtists(userId: string, collectionViewId?: string) {
    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .where('ur.userId = :userId', { userId });

    if (collectionViewId) {
      const cv = await this.userCollectionViewRepository.findOne({
        where: { id: collectionViewId, userId },
      });
      if (cv) {
        await this.applyFilters(urQB, cv.filters);
      }
    }

    const artists = await urQB
      .innerJoin(ReleaseArtist, 'stats_ra', 'stats_ra.releaseId = ur.releaseId')
      .leftJoin('stats_ra.artist', 'stats_artist')
      .select('stats_artist.id', 'artistId')
      .addSelect('stats_artist.name', 'artistName')
      .addSelect('stats_artist.nameLatin', 'artistNameLatin')
      .addSelect('COUNT(stats_artist.id)::int', 'artistCount')
      .orderBy('COUNT(stats_artist.id)', 'DESC')
      .groupBy('stats_artist.id')
      .getRawMany();

    const result = artists.map((ua) => ({
      id: ua.artistId,
      name: ua.artistName,
      nameLatin: ua.artistNameLatin,
      count: ua.artistCount,
    }));

    return result;
  }
  async userEntriesRatings(userId: string, collectionViewId?: string) {
    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .where('ur.userId = :userId', { userId });

    if (collectionViewId) {
      const cv = await this.userCollectionViewRepository.findOne({
        where: { id: collectionViewId, userId },
      });
      if (cv) {
        await this.applyFilters(urQB, cv.filters);
      }
    }

    const result = await urQB
      .leftJoin('ur.rating', 'stats_rating')
      .select('COUNT(*)::int', 'count')
      .addSelect(
        `
        CASE
          WHEN stats_rating.rating BETWEEN 0 AND 9 THEN 1
          WHEN stats_rating.rating BETWEEN 10 AND 19 THEN 2
          WHEN stats_rating.rating BETWEEN 20 AND 29 THEN 3
          WHEN stats_rating.rating BETWEEN 30 AND 39 THEN 4
          WHEN stats_rating.rating BETWEEN 40 AND 49 THEN 5
          WHEN stats_rating.rating BETWEEN 50 AND 59 THEN 6
          WHEN stats_rating.rating BETWEEN 60 AND 69 THEN 7
          WHEN stats_rating.rating BETWEEN 70 AND 79 THEN 8
          WHEN stats_rating.rating BETWEEN 80 AND 89 THEN 9
          WHEN stats_rating.rating BETWEEN 90 AND 99 THEN 10
          WHEN stats_rating.rating BETWEEN 100 AND 100 THEN 11
          ELSE -1
        END
      `,
        'bucket',
      )
      .groupBy('bucket')
      .getRawMany();

    return result;
  }
  async userEntriesGenres(userId: string, collectionViewId?: string) {
    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .where('ur.userId = :userId', { userId });

    if (collectionViewId) {
      const cv = await this.userCollectionViewRepository.findOne({
        where: { id: collectionViewId, userId },
      });
      if (cv) {
        await this.applyFilters(urQB, cv.filters);
      }
    }

    const genres = await urQB
      .innerJoin(
        ReleaseGenre,
        'stats_rg',
        'stats_rg.releaseId = ur.releaseId AND stats_rg.votesAvg > 0.5',
      )
      .leftJoin('stats_rg.genre', 'stats_genre')
      .select('stats_genre.id', 'genreId')
      .addSelect('stats_genre.name', 'genreName')
      .addSelect('COUNT(stats_genre.id)::int', 'genreCount')
      .orderBy('COUNT(stats_genre.id)', 'DESC')
      .groupBy('stats_genre.id')
      .getRawMany();

    const result = genres.map((ug) => ({
      id: ug.genreId,
      name: ug.genreName,
      count: ug.genreCount,
    }));

    return result;
  }
  async userEntriesLabels(userId: string, collectionViewId?: string) {
    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .where('ur.userId = :userId', { userId });

    if (collectionViewId) {
      const cv = await this.userCollectionViewRepository.findOne({
        where: { id: collectionViewId, userId },
      });
      if (cv) {
        await this.applyFilters(urQB, cv.filters);
      }
    }

    const labels = await urQB
      .innerJoin(ReleaseLabel, 'stats_rl', 'stats_rl.releaseId = ur.releaseId')
      .leftJoin('stats_rl.label', 'stats_label')
      .select('stats_label.id', 'labelId')
      .addSelect('stats_label.name', 'labelName')
      .addSelect('COUNT(stats_label.id)::int', 'labelCount')
      .orderBy('COUNT(stats_label.id)', 'DESC')
      .groupBy('stats_label.id')
      .getRawMany();

    const result = labels.map((ul) => ({
      id: ul.labelId,
      name: ul.labelName,
      count: ul.labelCount,
    }));

    return result;
  }
  async userEntriesReleaseDate(userId: string, collectionViewId?: string) {
    const urQB = this.userReleaseRepository
      .createQueryBuilder('ur')
      .where('ur.userId = :userId', { userId });

    if (collectionViewId) {
      const cv = await this.userCollectionViewRepository.findOne({
        where: { id: collectionViewId, userId },
      });
      if (cv) {
        await this.applyFilters(urQB, cv.filters);
      }
    }

    const result = await urQB
      .innerJoin(
        'ur.release',
        'stats_release',
        'stats_release.date is not null',
      )
      .select('EXTRACT(DECADE FROM stats_release.date)', 'decade')
      .addSelect('EXTRACT(YEAR FROM stats_release.date)', 'year')
      .addSelect('COUNT(*)::int')
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
