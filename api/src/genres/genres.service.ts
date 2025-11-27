import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateGenreVoteDto,
  IGenreResponse,
  IGenresResponse,
  IReleaseGenre,
} from 'shared';
import { Repository } from 'typeorm';
import { GenreSubmission } from '../../db/entities/genre-submission.entity';
import { Genre } from '../../db/entities/genre.entity';
import { ReleaseGenreVote } from '../../db/entities/release-genre-vote.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { UsersService } from '../users/users.service';

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
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<IGenresResponse> {
    const genres = await this.genreRepository.find({
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    });

    return {
      genres,
    };
  }

  async findOne(id: string): Promise<IGenreResponse> {
    const genre = await this.genreRepository.findOne({ where: { id } });

    if (!genre) throw new NotFoundException();

    return {
      genre,
    };
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
    changes: { name, bio, bioSource },
  }: GenreSubmission): Promise<Genre> {
    const genre = new Genre();
    genre.name = name;
    genre.bio = bio;
    genre.bioSource = bioSource;

    return this.genreRepository.save(genre);
  }

  async updateGenre({
    genreId,
    changes: { name, bio, bioSource },
  }: GenreSubmission): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { id: genreId },
    });

    if (!genre) throw new NotFoundException();

    genre.name = name;
    genre.bio = bio;
    genre.bioSource = bioSource;
    return this.genreRepository.save(genre);
  }
}
