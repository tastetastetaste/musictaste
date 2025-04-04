import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { ReleaseGenreVote } from '../../db/entities/release-genre-vote.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReleaseGenre, ReleaseGenreVote]),
    UsersModule,
  ],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
