import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import {
  IRelease,
  IReleaseFullInfo,
  IReleasesResponse,
  IReleaseStats,
  IReleaseWithStats,
  ITrackWithVotes,
  ReleaseType,
} from 'shared';
import { In, Repository } from 'typeorm';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { ReleaseLanguage } from '../../db/entities/release-language.entity';
import {
  ReleaseSubmission,
  TrackChanges,
} from '../../db/entities/release-submission.entity';
import { Release } from '../../db/entities/release.entity';
import { Track } from '../../db/entities/track.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { genId } from '../common/genId';
import { ImagesService } from '../images/images.service';
import { UsersService } from '../users/users.service';

export type ReleaseCountType =
  | 'ratings'
  | 'entries'
  | 'ratings'
  | 'reviews'
  | 'lists';

@Injectable()
export class ReleasesService {
  constructor(
    @InjectRepository(Release) private releasesRepository: Repository<Release>,
    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,
    @InjectRepository(UserRelease)
    private userReleaseRepository: Repository<UserRelease>,
    @InjectRepository(ReleaseArtist)
    private releaseArtistRepository: Repository<ReleaseArtist>,

    @InjectRepository(ReleaseLabel)
    private releaseLabelRepository: Repository<ReleaseLabel>,
    @InjectRepository(ReleaseLanguage)
    private releaseLanguageRepository: Repository<ReleaseLanguage>,
    @InjectRepository(Track) private tracksRepository: Repository<Track>,
    @InjectRepository(ReleaseSubmission)
    private releasesSubmissions: Repository<ReleaseSubmission>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private imagesService: ImagesService,
  ) {}

  async statsLoader(ids: string[]): Promise<Record<string, IReleaseStats>> {
    const raws = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .select('ur.releaseId', 'id')
      .addSelect('COUNT(*)', 'entriesCount')
      .addSelect('COUNT(ur.ratingId)', 'ratingsCount')
      .addSelect('COUNT(ur.reviewId)', 'reviewsCount')
      .addSelect('AVG(rating.rating)', 'ratingsAvg')
      .leftJoin('ur.rating', 'rating')
      .where('ur.releaseId IN (:...ids)', { ids })
      .groupBy('ur.releaseId')
      .getRawMany();

    const resultMap: Record<string, IReleaseStats> = {};

    raws.forEach((raw) => {
      resultMap[raw.id] = {
        entriesCount: parseInt(raw.entriesCount, 10),
        ratingsCount: parseInt(raw.ratingsCount, 10),
        ratingsAvg: parseFloat(raw.ratingsAvg),
        reviewsCount: parseInt(raw.reviewsCount, 10),
      };
    });

    return resultMap;
  }

  async getReleasesByIds(ids: string[]): Promise<IRelease[]> {
    if (ids.length === 0) return [];

    const result = await this.releasesRepository
      .createQueryBuilder('release')
      .select([
        'release.id',
        'release.title',
        'release.date',
        'release.type',
        'release.imagePath',
      ])
      .leftJoinAndSelect('release.artistConnection', 'releaseArtists')
      .leftJoinAndSelect('releaseArtists.artist', 'artist')
      .whereInIds(ids)
      .getMany();

    const releases: Release[] = [];

    ids.forEach((id) => {
      const release = result.find((release) => release.id === id);
      if (release) releases.push(release);
    });

    return releases.map((r) => {
      const { artistConnection, type, ...rest } = r;

      return {
        ...rest,
        type: ReleaseType[type],
        date: r.date.toString(),
        artists: artistConnection.map((ac: any) => ac.artist),
        cover: this.imagesService.getReleaseCover(r.imagePath),
      };
    });
  }

  async getReleasesByIdsWithStats(ids: string[]): Promise<IReleaseWithStats[]> {
    if (ids.length === 0) return [];

    const releases = await this.getReleasesByIds(ids);

    const releasesStats = await this.statsLoader(ids);

    return releases.map((r) => ({
      ...r,
      stats: releasesStats[r.id],
    }));
  }

  async getReleaseFullInfo(id: string): Promise<IReleaseFullInfo> {
    const r = await this.releasesRepository
      .createQueryBuilder('release')
      .select([
        'release.id',
        'release.title',
        'release.date',
        'release.type',
        'release.imagePath',
      ])
      .leftJoinAndSelect('release.artistConnection', 'releaseArtists')
      .leftJoinAndSelect('releaseArtists.artist', 'artist')
      .leftJoinAndSelect('release.genreConnection', 'releaseGenre')
      .leftJoinAndSelect('releaseGenre.genre', 'genre')
      .leftJoinAndSelect('release.labelConnection', 'releaseLabel')
      .leftJoinAndSelect('releaseLabel.label', 'label')
      .leftJoinAndSelect('release.languageConnection', 'releaseLanguage')
      .leftJoinAndSelect('releaseLanguage.language', 'language')
      .where('release.id = :id', { id })
      .getOne();

    if (!r) throw new NotFoundException();

    const {
      artistConnection,
      languageConnection,
      labelConnection,
      genreConnection,
      type,
      ...rest
    } = r;

    const stats = await this.statsLoader([id]);

    return {
      ...rest,
      type: ReleaseType[type],
      date: r.date.toString(),
      artists: artistConnection.map((ac: any) => ac.artist),
      languages: languageConnection.map((lc: any) => lc.language),
      labels: labelConnection.map((lc: any) => lc.__label__),
      genres: genreConnection
        .filter((gc) => gc.votesAvg > 0)
        .map((gc: any) => gc.genre),
      cover: this.imagesService.getReleaseCover(r.imagePath),
      stats: stats[id],
    };
  }

  async getReleasesByArtist(artistId: string) {
    const res = await this.releaseArtistRepository.find({
      where: { artistId },
    });

    const result = this.getReleasesByIdsWithStats(
      res.map((ra) => ra.releaseId),
    );

    return result;
  }

  async getReleasesByLabel(labelId: string) {
    const res = await this.releaseLabelRepository.find({
      where: { labelId },
    });

    const result = this.getReleasesByIdsWithStats(
      res.map((ra) => ra.releaseId),
    );

    return result;
  }

  async getContributors(id: string) {
    const releaseSubmissions = await this.releasesSubmissions.find({
      where: { releaseId: id },
      select: ['userId'],
      order: {
        createdAt: 'ASC',
      },
    });

    const uniqueUserIds: string[] = [];

    releaseSubmissions &&
      releaseSubmissions.forEach((rs: any) => {
        if (!uniqueUserIds.includes(rs.userId)) {
          uniqueUserIds.push(rs.userId);
        }
      });

    const users = await this.usersService.getUsersByIds(uniqueUserIds);
    return users;
  }

  async getReleaseTracks(id: string): Promise<ITrackWithVotes[]> {
    const tracks = await this.tracksRepository
      .createQueryBuilder('track')
      .addSelect('SUM(CASE WHEN vote.vote = 1 THEN 1 END)', 'upvotes')
      .addSelect('SUM(CASE WHEN vote.vote = -1 THEN 1 END)', 'downvotes')
      .leftJoin('track.votes', 'vote')
      .where('track.releaseId = :releaseId', { releaseId: id })
      .orderBy('track.order', 'ASC')
      .groupBy('track.id')
      .getRawMany();
    return tracks.map((t) => ({
      id: t.track_id,
      track: t.track_track,
      order: t.track_order,
      title: t.track_title,
      upvotes: t.upvotes || 0,
      downvotes: t.downvotes || 0,
      durationMs: t.track_durationMs,
    }));
  }

  async findNewReleases(page: number = 1, pageSize: number = 48) {
    const qb = this.releasesRepository
      .createQueryBuilder('release')
      .select('release.id', 'id')
      .where("release.date >= date_trunc('year', current_date)")
      .andWhere('release.date <= current_date');

    const qb2 = qb.clone();

    const res = await qb
      .orderBy('release.date', 'DESC')
      .addOrderBy('release.id', 'ASC')
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getRawMany();

    const releases = await this.getReleasesByIdsWithStats(res.map((r) => r.id));

    const totalItems = await qb2.getCount();

    return {
      releases,
      totalItems,
    };
  }

  async findUpcomingReleases(page: number = 1, pageSize: number = 48) {
    const qb = this.releasesRepository
      .createQueryBuilder('release')
      .select('release.id', 'id')
      .where('release.date > CURRENT_DATE');

    const qb2 = qb.clone();

    const res = await qb
      .orderBy('release.date', 'ASC')
      .addOrderBy('release.id', 'ASC')
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getRawMany();

    const releases = await this.getReleasesByIdsWithStats(res.map((r) => r.id));

    const totalItems = await qb2.getCount();

    return {
      releases,
      totalItems,
    };
  }

  async findRecentlyAddedReleases(page: number = 1, pageSize: number = 48) {
    const qb = this.releasesRepository
      .createQueryBuilder('release')
      .select('release.id', 'id')
      .where("release.createdAt >= date_trunc('year', current_date)");

    const totalItems = await qb.clone().getCount();

    const res = await qb
      .orderBy('release.createdAt', 'DESC')
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getRawMany();

    const releases = await this.getReleasesByIdsWithStats(res.map((r) => r.id));

    return {
      releases,
      totalItems,
    };
  }

  async findPopularReleases(page: number = 1, pageSize: number = 48) {
    const qb = this.releasesRepository
      .createQueryBuilder('release')
      .select('release.id', 'id')
      .addSelect('COUNT(ur.id)', 'popularity')
      .leftJoin('release.entries', 'ur', 'release.id = ur.releaseId')
      .where("ur.createdAt >= date_trunc('year', current_date)")
      .groupBy('release.id')
      .orderBy('popularity', 'DESC')
      .addOrderBy('release.id', 'DESC')
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const qb2 = qb.clone();

    const releases = await this.getReleasesByIdsWithStats(
      (await qb.getRawMany()).map((r) => r.id),
    );

    const totalItems = await qb2.getCount();

    return {
      releases,
      totalItems,
    };
  }

  async findTopReleasesOAT(page: number = 1, pageSize: number = 48) {
    const result = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .select('ur.releaseId', 'releaseId')
      .addSelect('AVG(rating.rating)', 'averageRating')
      .leftJoin('ur.release', 'release')
      .leftJoin('ur.rating', 'rating')
      .where('release.type = :releaseType', { releaseType: ReleaseType.LP })
      .groupBy('ur.releaseId')
      .having('COUNT(rating.id) >= 3')
      .orderBy('AVG(rating.rating)', 'DESC', 'NULLS LAST')
      .addOrderBy('ur.releaseId', 'DESC')
      .limit(100)
      .getRawMany();

    const ids = result
      .slice((page - 1) * pageSize, page * pageSize)
      .map((i) => i.releaseId);

    const releases = await this.getReleasesByIdsWithStats(ids);

    return {
      releases,
      totalItems: result.length,
    };
  }

  async findTopReleasesOTY(page: number = 1, pageSize: number = 48) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear + 1, 0, 1);

    const result = await this.userReleaseRepository
      .createQueryBuilder('ur')
      .select('ur.releaseId', 'releaseId')
      .addSelect('AVG(rating.rating)', 'averageRating')
      .leftJoin('ur.release', 'release')
      .leftJoin('ur.rating', 'rating')
      .where('release.date >= :startDate AND release.date < :endDate', {
        startDate,
        endDate,
      })
      .andWhere('release.type = :releaseType', { releaseType: ReleaseType.LP })
      .groupBy('ur.releaseId')
      // .having('COUNT(rating) >= 2')
      .orderBy('AVG(rating.rating)', 'DESC', 'NULLS LAST')
      .addOrderBy('ur.releaseId', 'DESC')
      .limit(100)
      .getRawMany();

    const ids = result
      .slice((page - 1) * pageSize, page * pageSize)
      .map((i) => i.releaseId);

    const releases = await this.getReleasesByIdsWithStats(ids);

    return {
      releases,
      totalItems: result.length,
    };
  }

  async createRelease({
    changes: {
      title,
      artistsIds,
      date,
      labelsIds,
      languagesIds,
      tracks,
      type,
      imagePath,
    },
  }: ReleaseSubmission) {
    const newRelease = new Release();

    newRelease.title = title;
    newRelease.type = type;
    newRelease.date = dayjs(date).format('YYYY-MM-DD').toString();
    newRelease.imagePath = imagePath;

    try {
      const release = await this.releasesRepository.save(newRelease);

      const artists = await this.artistsRepository.find({
        where: {
          id: In(artistsIds),
        },
        select: ['id'],
      });

      await this.releaseArtistRepository
        .createQueryBuilder()
        .insert()
        .into(ReleaseArtist)
        .values(
          artists.map((a) => ({
            artistId: a.id,
            releaseId: release.id,
          })),
        )
        .execute();

      if (languagesIds && languagesIds.length !== 0) {
        await this.releaseLanguageRepository
          .createQueryBuilder()
          .insert()
          .into(ReleaseLanguage)
          .values(
            languagesIds.map((lId) => ({
              languageId: lId,
              releaseId: release.id,
            })),
          )
          .execute();
      }

      if (labelsIds && labelsIds.length !== 0 && labelsIds[0].length !== 0) {
        await this.releaseLabelRepository
          .createQueryBuilder()
          .insert()
          .into(ReleaseLabel)
          .values(
            labelsIds.map((lId) => ({
              labelId: lId,
              releaseId: release.id,
            })),
          )
          .execute();
      }

      if (tracks && tracks.length !== 0) {
        await this.tracksRepository
          .createQueryBuilder()
          .insert()
          .into(Track)
          .values(
            tracks.map((t, i) => ({
              id: genId(),
              releaseId: release.id,
              track: t.track,
              order: i,
              title: t.title,
              durationMs: t.durationMs || undefined,
            })),
          )
          .execute();
      }

      return release;
    } catch (err) {
      console.log('failed to create associated data', err);
      throw new InternalServerErrorException(
        'failed to create associated data',
      );
    }
  }

  async updateRelease(submission: ReleaseSubmission) {
    const _release = await this.releasesRepository.findOne({
      where: { id: submission.releaseId },
    });

    if (!_release) {
      throw new NotFoundException('Release not found');
    }

    const {
      title,
      date,
      type,
      imagePath,
      artistsIds,
      labelsIds,
      languagesIds,
      tracks,
    } = submission.changes;

    if (title) _release.title = title;
    if (date) _release.date = dayjs(date).format('YYYY-MM-DD').toString();
    if (type) _release.type = type;
    if (imagePath) _release.imagePath = imagePath;

    if (artistsIds) {
      const releaseArtists = await this.releaseArtistRepository.find({
        where: { releaseId: _release.id },
        select: ['artistId'],
      });

      const { addedIds, removedIds } = this.compareIds(
        artistsIds,
        releaseArtists.map((ra) => ra.artistId),
      );

      addedIds.length > 0 &&
        addedIds.forEach(async (addedId) => {
          const _ra = this.releaseArtistRepository.create({
            artistId: addedId,
            releaseId: _release.id,
          });
          await this.releaseArtistRepository.save(_ra);
        });

      removedIds.length > 0 &&
        removedIds.forEach(async (removedId) => {
          await this.releaseArtistRepository.delete({
            artistId: removedId,
            releaseId: _release.id,
          });
        });
    }

    if (labelsIds) {
      const releaseLabels = await this.releaseLabelRepository.find({
        where: { releaseId: _release.id },
        select: ['labelId'],
      });

      const { addedIds, removedIds } = this.compareIds(
        labelsIds,
        releaseLabels.map((rl) => rl.labelId),
      );

      addedIds.length > 0 &&
        addedIds.forEach(async (addedId) => {
          const _rl = this.releaseLabelRepository.create({
            labelId: addedId,
            releaseId: _release.id,
          });
          await this.releaseLabelRepository.save(_rl);
        });

      removedIds.length > 0 &&
        removedIds.forEach(async (removedId) => {
          await this.releaseLabelRepository.delete({
            labelId: removedId,
            releaseId: _release.id,
          });
        });
    }

    if (languagesIds) {
      const releaseLanguages = await this.releaseLanguageRepository.find({
        where: { releaseId: _release.id },
        select: ['languageId'],
      });

      const { addedIds, removedIds } = this.compareIds(
        languagesIds,
        releaseLanguages.map((rl) => rl.languageId),
      );

      addedIds.length > 0 &&
        addedIds.forEach(async (addedId) => {
          const _rl = this.releaseLanguageRepository.create({
            languageId: addedId,
            releaseId: _release.id,
          });
          await this.releaseLanguageRepository.save(_rl);
        });

      removedIds.length > 0 &&
        removedIds.forEach(async (removedId) => {
          await this.releaseLanguageRepository.delete({
            languageId: removedId,
            releaseId: _release.id,
          });
        });
    }

    if (tracks) {
      await this.updateTracks(_release.id, tracks);
    }

    const release = await this.releasesRepository.save(_release);

    return release;
  }

  async deleteRelease(id: string) {
    return await this.releasesRepository.delete(id);
  }

  private async updateTracks(releaseId: string, newTracks: TrackChanges[]) {
    const oldTracks = await this.tracksRepository
      .createQueryBuilder('t')
      .where('t.releaseId = :releaseId', { releaseId })
      .orderBy('t.order', 'ASC')
      .getMany();

    const tracksToAdd: Partial<Track>[] = [];
    const tracksToUpdate: Partial<Track>[] = [];
    const tracksToRemove: Track[] = [];

    const oldTrackMap = new Map(oldTracks.map((t) => [t.id, t]));

    // Check for tracks to add or update
    newTracks.forEach((newTrack, order) => {
      if (newTrack.id) {
        const existingTrack = oldTrackMap.get(newTrack.id);
        if (existingTrack) {
          if (
            existingTrack.track !== newTrack.track ||
            existingTrack.title !== newTrack.title ||
            existingTrack.durationMs !== newTrack.durationMs ||
            existingTrack.order !== order
          ) {
            tracksToUpdate.push({
              id: existingTrack.id,
              track: newTrack.track,
              title: newTrack.title,
              durationMs: newTrack.durationMs,
              order,
            });
          }

          // Remove from Map
          oldTrackMap.delete(newTrack.id);
        } else {
          tracksToAdd.push({ ...newTrack, order, releaseId });
        }
      } else {
        tracksToAdd.push({ ...newTrack, order, releaseId });
      }
    });

    // Remove remaining tracks
    tracksToRemove.push(...oldTrackMap.values());

    if (tracksToRemove.length > 0) {
      await this.tracksRepository.remove(tracksToRemove);
    }

    if (tracksToUpdate.length > 0) {
      await Promise.all(
        tracksToUpdate.map((track) =>
          this.tracksRepository.update({ id: track.id }, track),
        ),
      );
    }

    if (tracksToAdd.length > 0) {
      await this.tracksRepository
        .createQueryBuilder()
        .insert()
        .into(Track)
        .values(
          tracksToAdd.map((t) => ({
            ...t,
            id: genId(),
          })),
        )
        .execute();
    }
  }

  private compareIds(newIds: string[], currentIds: string[]) {
    const addedIds = newIds.filter(
      (id) => !currentIds.some((appliedId) => appliedId === id),
    );
    const removedIds = currentIds.filter(
      (appliedId) => !newIds.some((id) => id === appliedId),
    );

    return { addedIds, removedIds };
  }
}
