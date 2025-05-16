import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleasesModule } from '../releases/releases.module';
import { SubmissionModule } from '../submission/submission.module';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist, ArtistSubmission, ReleaseArtist]),
    ReleasesModule,
    SubmissionModule,
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
})
export class ArtistsModule {}
