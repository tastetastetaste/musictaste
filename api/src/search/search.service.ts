import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountStatus, ISearchResponse } from 'shared';
import { Repository } from 'typeorm';
import { Artist } from '../../db/entities/artist.entity';
import { Genre } from '../../db/entities/genre.entity';
import { Label } from '../../db/entities/label.entity';
import { Release } from '../../db/entities/release.entity';
import { User } from '../../db/entities/user.entity';
import { ImagesService } from '../images/images.service';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Release) private releasesRepository: Repository<Release>,
    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,
    @InjectRepository(Label) private labelsRepository: Repository<Label>,
    @InjectRepository(Genre) private genresRepository: Repository<Genre>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private imagesService: ImagesService,
  ) {}

  async search({
    q: query,
    type,
    page,
    pageSize,
  }: SearchDto): Promise<ISearchResponse> {
    const q = query.trim();
    const curPageSize = pageSize || 10;
    const take = (page || 1) * curPageSize;
    const skip = ((page || 1) - 1) * curPageSize;

    const [releases, artists, labels, genres, users] = await Promise.all([
      type.includes('releases')
        ? this.releasesRepository
            .createQueryBuilder('r')
            .select([
              'r.id',
              'r.title',
              'r.titleLatin',
              'r.imagePath',
              'a.id',
              'a.name',
              'a.nameLatin',
              'r.explicitCoverArt',
            ])
            .leftJoinAndSelect('r.artistConnection', 'ac')
            .leftJoinAndSelect('ac.artist', 'a')
            .where('r.title ilike :title', {
              title: `${q}%`,
            })
            .orWhere('r.titleLatin ilike :titleLatin', {
              titleLatin: `${q}%`,
            })
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('artists')
        ? this.artistsRepository
            .createQueryBuilder('a')
            .select(['a.id', 'a.name', 'a.nameLatin'])
            .where('a.name ilike :name', {
              name: `${q}%`,
            })
            .orWhere('a.nameLatin ilike :nameLatin', {
              nameLatin: `${q}%`,
            })
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('labels')
        ? this.labelsRepository
            .createQueryBuilder('label')
            .select(['label.id', 'label.name', 'label.nameLatin'])
            .where('label.name ilike :name', {
              name: `${q}%`,
            })
            .orWhere('label.nameLatin ilike :nameLatin', {
              nameLatin: `${q}%`,
            })
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('genres')
        ? this.genresRepository
            .createQueryBuilder('genre')
            .select(['genre.id', 'genre.name'])
            .where('genre.name ilike :name', {
              name: `${q}%`,
            })
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('users')
        ? this.usersRepository
            .createQueryBuilder('u')
            .select([
              'u.id',
              'u.username',
              'u.name',
              'u.imagePath',
              'u.supporter',
              'u.contributorStatus',
              'u.accountStatus',
            ])
            .where('(u.username ilike :username OR u.name ilike :name)', {
              username: `${q}%`,
              name: `${q}%`,
            })
            .andWhere('u.accountStatus NOT IN (:...excludedStatuses)', {
              excludedStatuses: [AccountStatus.BANNED, AccountStatus.DELETED],
            })
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
    ]);

    return {
      releases:
        typeof releases !== 'boolean'
          ? releases[0]?.map(({ artistConnection, ...r }) => ({
              ...r,
              cover: this.imagesService.getReleaseCover(r.imagePath),
              artists: artistConnection.map((ac) => ac.artist),
            }))
          : undefined,
      releasesCount: typeof releases !== 'boolean' ? releases[1] : undefined,
      artists: typeof artists !== 'boolean' ? artists[0] : undefined,
      artistsCount: typeof artists !== 'boolean' ? artists[1] : undefined,
      labels: typeof labels !== 'boolean' ? labels[0] : undefined,
      labelsCount: typeof labels !== 'boolean' ? labels[1] : undefined,
      genres: typeof genres !== 'boolean' ? genres[0] : undefined,
      genresCount: typeof genres !== 'boolean' ? genres[1] : undefined,
      users:
        typeof users !== 'boolean'
          ? users[0].map((u) => ({
              ...u,
              image: this.imagesService.getUserImage(u.imagePath),
            }))
          : undefined,
      usersCount: typeof users !== 'boolean' ? users[1] : undefined,
    };
  }
}
