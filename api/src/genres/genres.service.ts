import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateGenreVoteDto,
  FindUserGenreVotesDto,
  IFindUserGenreVotesResponse,
  IGenreResponse,
  IGenresResponse,
  IReleaseGenre,
  VoteType,
} from 'shared';
import { In, Repository } from 'typeorm';
import { GenreSubmission } from '../../db/entities/genre-submission.entity';
import { Genre } from '../../db/entities/genre.entity';
import { GenreParent } from '../../db/entities/genre-parent.entity';
import { ReleaseGenreVote } from '../../db/entities/release-genre-vote.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { UsersService } from '../users/users.service';
import { ReleasesService } from '../releases/releases.service';
import { compareIds } from '../common/compareIds';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(ReleaseGenre)
    private releaseGenresRepository: Repository<ReleaseGenre>,

    @InjectRepository(ReleaseGenreVote)
    private releaseGenreVotesRepository: Repository<ReleaseGenreVote>,

    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    @InjectRepository(ReleaseGenre)
    private releaseGenreRepository: Repository<ReleaseGenre>,
    @InjectRepository(GenreParent)
    private genreParentRepository: Repository<GenreParent>,
    private usersService: UsersService,
    private releasesService: ReleasesService,
    private redisService: RedisService,
  ) {}

  async findAll(): Promise<IGenresResponse> {
    const genres = await this.genreRepository.find({
      select: ['id', 'name'],
      relations: ['parentsConnection'],
      order: {
        name: 'ASC',
      },
    });

    return {
      genres: genres.map((genre: any) => ({
        id: genre.id,
        name: genre.name,
        parentIds: genre.__parentsConnection__?.map((p) => p.parentId) || [],
      })),
    };
  }

  async findOne(id: string): Promise<IGenreResponse> {
    const genre = (await this.genreRepository.findOne({
      where: { id },
      relations: ['parentsConnection', 'childrenConnection'],
    })) as any;

    if (!genre) throw new NotFoundException();

    return {
      genre: {
        id: genre.id,
        name: genre.name,
        bio: genre.bio,
        bioSource: genre.bioSource,
        parentIds: genre.__parentsConnection__?.map((p) => p.parentId) || [],
        subgenreIds: genre.__childrenConnection__?.map((p) => p.genreId) || [],
      },
    };
  }

  async getGenresByIds(ids: string[]) {
    const genres = await this.genreRepository.find({
      select: ['id', 'name'],
      relations: ['parentsConnection'],
      where: {
        id: In(ids),
      },
    });
    return genres.map((g: any) => ({
      id: g.id,
      name: g.name,
      parentIds: g.__parentsConnection__?.map((p) => p.parentId) || [],
    }));
  }

  async releaseGenres(releaseId: string): Promise<IReleaseGenre[]> {
    const releaseGenres = await this.releaseGenresRepository
      .createQueryBuilder('rg')
      .where('rg.releaseId = :releaseId', { releaseId })
      .leftJoinAndSelect('rg.genre', 'genre')
      .leftJoinAndSelect('rg.genreVotes', 'gv')
      .orderBy('rg.votesAvg', 'DESC')
      .getMany();

    if (releaseGenres.length === 0) return [];

    const userIds = releaseGenres
      .map((rg) => rg.genreVotes.map((gv) => gv.userId))
      .flat();
    const users = await this.usersService.getUsersByIds(userIds);

    return releaseGenres.map((rg) => ({
      ...rg,
      valid: rg.votesAvg > 0,
      genreVotes: rg.genreVotes.map((gv) => ({
        ...gv,
        user: users.find((u) => u.id === gv.userId),
      })),
    }));
  }

  async genreVote(
    { genreId, releaseId, voteType }: CreateGenreVoteDto,
    userId: string,
  ) {
    let rg = await this.releaseGenresRepository.findOne({
      where: {
        releaseId,
        genreId,
      },
    });

    if (!rg) {
      const _rg = this.releaseGenresRepository.create({
        releaseId,
        genreId,
        votesAvg: voteType,
        votesCount: 1,
      });

      rg = await this.releaseGenresRepository.save(_rg);

      // create new vote
      const _rgv = this.releaseGenreVotesRepository.create({
        releaseGenreId: rg.id,
        userId,
        type: voteType,
      });
      await this.releaseGenreVotesRepository.save(_rgv);
    } else {
      const existingVote = await this.releaseGenreVotesRepository.findOne({
        where: {
          releaseGenreId: rg.id,
          userId,
        },
      });

      if (existingVote) {
        return false;
      }

      // create new vote
      const _rgv = this.releaseGenreVotesRepository.create({
        releaseGenreId: rg.id,
        userId,
        type: voteType,
      });
      await this.releaseGenreVotesRepository.save(_rgv);

      // Calculate new average
      const newAvg =
        (rg.votesAvg * rg.votesCount + voteType) / (rg.votesCount + 1);
      rg.votesCount = rg.votesCount + 1;
      rg.votesAvg = newAvg;
      await this.releaseGenresRepository.save(rg);
    }

    return true;
  }

  async removeGenreVote({ releaseGenreId }, userId: string) {
    if (!userId) return false;

    const rg = await this.releaseGenresRepository.findOne({
      where: {
        id: releaseGenreId,
      },
    });

    if (!rg) return false;

    if (rg.votesCount === 1) {
      this.releaseGenresRepository.delete({ id: rg.id });
    } else {
      const firstVote = await this.releaseGenreVotesRepository.findOne({
        where: { releaseGenreId: rg.id },
        order: { createdAt: 'ASC' },
      });

      if (
        firstVote &&
        firstVote.userId === userId &&
        firstVote.type === VoteType.UP
      ) {
        throw new BadRequestException(
          'The original upvote for a genre cannot be removed.',
        );
      }

      await this.releaseGenreVotesRepository.delete({
        releaseGenreId,
        userId,
      });

      const raw = await this.releaseGenreVotesRepository
        .createQueryBuilder('rgv')
        .select('AVG(rgv.type)', 'avg')
        .where('rgv.releaseGenreId = :rgId', { rgId: rg.id })
        .getRawOne();

      await this.releaseGenresRepository.update(
        { id: rg.id },
        {
          votesAvg: raw.avg,
          votesCount: () => 'votesCount - 1',
        },
      );
    }

    return true;
  }

  async createGenre({
    changes: { name, bio, bioSource, parentIds },
  }: GenreSubmission): Promise<Genre> {
    const genre = new Genre();
    genre.name = name;
    genre.bio = bio;
    genre.bioSource = bioSource;

    const savedGenre = await this.genreRepository.save(genre);

    if (parentIds && parentIds.length > 0) {
      const genreParents = parentIds.map((parentId) => {
        return this.genreParentRepository.create({
          genreId: savedGenre.id,
          parentId,
        });
      });
      await this.genreParentRepository.save(genreParents);
    }

    await this.redisService.invalidateGenresCache();

    return savedGenre;
  }

  async updateGenre({
    genreId,
    changes: { name, bio, bioSource, parentIds },
  }: GenreSubmission): Promise<Genre> {
    const genre = (await this.genreRepository.findOne({
      where: { id: genreId },
      relations: ['parentsConnection'],
    })) as any;

    if (!genre) throw new NotFoundException();

    genre.name = name;
    genre.bio = bio;
    genre.bioSource = bioSource;

    const savedGenre = await this.genreRepository.save(genre);

    const oldParentIds = genre.__parentsConnection__?.map((p) => p.parentId);

    const { addedIds, removedIds } = compareIds(parentIds, oldParentIds);

    if (removedIds && removedIds.length > 0) {
      await this.genreParentRepository.delete({
        genreId: savedGenre.id,
        parentId: In(removedIds),
      });
    }

    if (addedIds && addedIds.length > 0) {
      const genreParents = addedIds.map((parentId) => {
        return this.genreParentRepository.create({
          genreId: savedGenre.id,
          parentId,
        });
      });
      await this.genreParentRepository.save(genreParents);
    }

    await this.redisService.invalidateGenresCache();

    return savedGenre;
  }

  async getUserGenreVotes(
    userId: string,
    { page, genreId }: FindUserGenreVotesDto,
  ): Promise<IFindUserGenreVotesResponse> {
    const pageSize = 40;

    const qb = this.releaseGenreRepository
      .createQueryBuilder('rg')
      .innerJoinAndSelect(
        'rg.genreVotes',
        'genreVote',
        'genreVote.userId = :userId',
        {
          userId,
        },
      );

    if (genreId) qb.andWhere('rg.genreId = :genreId', { genreId });

    const [releaseGenres, totalItems] = await qb
      .orderBy('genreVote.createdAt', 'DESC')
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getManyAndCount();

    const releases = await this.releasesService.getReleasesByIds(
      releaseGenres.map((rg) => rg.releaseId),
    );
    const genres = await this.getGenresByIds(
      releaseGenres.map((rg) => rg.genreId),
    );

    return {
      votes: releaseGenres.map((rg) => ({
        ...rg,
        release: releases.find((r) => r.id === rg.releaseId),
        genre: genres.find((g) => g.id === rg.genreId),
        type: rg.genreVotes[0].type,
      })),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + releaseGenres.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
}
