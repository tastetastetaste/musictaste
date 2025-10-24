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
            .addSelect(
              `ts_rank(
                setweight(to_tsvector('simple', unaccent(r.title || ' ' || COALESCE(r.titleLatin, ''))), 'A') ||
                setweight(to_tsvector('simple', unaccent(a.name || ' ' || COALESCE(a.nameLatin, ''))), 'B'),
                plainto_tsquery('simple', unaccent(:query))
              )`,
              'search_rank',
            )
            .leftJoinAndSelect('r.artistConnection', 'ac')
            .leftJoinAndSelect('ac.artist', 'a')
            .where(
              `(
                setweight(to_tsvector('simple', unaccent(r.title || ' ' || COALESCE(r.titleLatin, ''))), 'A') ||
                setweight(to_tsvector('simple', unaccent(a.name || ' ' || COALESCE(a.nameLatin, ''))), 'B')
              ) @@ plainto_tsquery('simple', unaccent(:query))`,
            )
            .orderBy('search_rank', 'DESC')
            .setParameter('query', q)
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('artists')
        ? this.artistsRepository
            .createQueryBuilder('a')
            .select(['a.id', 'a.name', 'a.nameLatin'])
            .addSelect(
              `ts_rank(
                to_tsvector('simple', unaccent(a.name || ' ' || COALESCE(a.nameLatin, ''))),
                plainto_tsquery('simple', unaccent(:query))
              )`,
              'search_rank',
            )
            .where(
              `to_tsvector('simple', unaccent(a.name || ' ' || COALESCE(a.nameLatin, ''))) @@ plainto_tsquery('simple', unaccent(:query))`,
            )
            .orderBy('search_rank', 'DESC')
            .setParameter('query', q)
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('labels')
        ? this.labelsRepository
            .createQueryBuilder('label')
            .select(['label.id', 'label.name', 'label.nameLatin'])
            .addSelect(
              `ts_rank(
                to_tsvector('simple', unaccent(label.name || ' ' || COALESCE(label.nameLatin, ''))),
                plainto_tsquery('simple', unaccent(:query))
              )`,
              'search_rank',
            )
            .where(
              `to_tsvector('simple', unaccent(label.name || ' ' || COALESCE(label.nameLatin, ''))) @@ plainto_tsquery('simple', unaccent(:query))`,
            )
            .orderBy('search_rank', 'DESC')
            .setParameter('query', q)
            .take(take)
            .skip(skip)
            .getManyAndCount()
        : Promise.resolve(false),
      type.includes('genres')
        ? this.genresRepository
            .createQueryBuilder('genre')
            .select(['genre.id', 'genre.name'])
            .addSelect(
              `ts_rank(
                to_tsvector('simple', genre.name),
                plainto_tsquery('simple', :query)
              )`,
              'search_rank',
            )
            .where(
              `to_tsvector('simple', genre.name) @@ plainto_tsquery('simple', :query)`,
            )
            .orderBy('search_rank', 'DESC')
            .setParameter('query', q)
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
            .addSelect(
              `ts_rank(
                to_tsvector('simple', unaccent(u.username || ' ' || COALESCE(u.name, ''))),
                plainto_tsquery('simple', unaccent(:query))
              )`,
              'search_rank',
            )
            .where(
              `to_tsvector('simple', unaccent(u.username || ' ' || COALESCE(u.name, ''))) @@ plainto_tsquery('simple', unaccent(:query))`,
            )
            .andWhere('u.accountStatus NOT IN (:...excludedStatuses)', {
              excludedStatuses: [AccountStatus.BANNED, AccountStatus.DELETED],
            })
            .orderBy('search_rank', 'DESC')
            .setParameter('query', q)
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
