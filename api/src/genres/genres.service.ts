import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGenreVoteDto, IGenreResponse, IReleaseGenre } from 'shared';
import { Repository } from 'typeorm';
import { GenreChanges } from '../../db/entities/genre-submission.entity';
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
      const _rg = new ReleaseGenre();
      _rg.releaseId = releaseId;
      _rg.genreId = genreId;
      _rg.votesAvg = 1;
      _rg.votesCount = 1;
      rg = await this.releaseGenresRepository.save(_rg);
    } else {
      const newAvg =
        (rg.votesAvg * rg.votesCount + voteType) / (rg.votesCount + 1);
      await this.releaseGenresRepository.update(
        { id: rg.id },
        {
          votesAvg: newAvg,
          votesCount: () => 'votesCount + 1',
        },
      );
    }

    const _rgv = new ReleaseGenreVote();
    _rgv.releaseGenreId = rg.id;
    _rgv.userId = userId;
    _rgv.type = voteType;

    await this.releaseGenreVotesRepository.save(_rgv);

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

  async createGenre({ name, bio }: GenreChanges): Promise<Genre> {
    const genre = new Genre();
    genre.name = name;
    genre.bio = bio;

    return this.genreRepository.save(genre);
  }
}
