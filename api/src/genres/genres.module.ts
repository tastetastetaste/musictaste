import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { ReleaseGenreVote } from '../../db/entities/release-genre-vote.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { Genre } from '../../db/entities/genre.entity';
import { GenreParent } from '../../db/entities/genre-parent.entity';
import { ReleasesModule } from '../releases/releases.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReleaseGenre,
      ReleaseGenreVote,
      Genre,
      GenreParent,
    ]),
    UsersModule,
    ReleasesModule,
    RedisModule,
  ],
  controllers: [GenresController],
  providers: [GenresService],
  exports: [GenresService],
})
export class GenresModule {}
