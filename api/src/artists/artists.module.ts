import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { EntitiesModule } from '../entities/entities.module';
import { ReleasesModule } from '../releases/releases.module';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { RelatedArtist } from '../../db/entities/related-artist.entity';
import { GroupArtist } from '../../db/entities/group-artist.entity';
import { Country } from '../../db/entities/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artist,
      ArtistSubmission,
      ReleaseArtist,
      RelatedArtist,
      GroupArtist,
      Country,
    ]),
    ReleasesModule,
    EntitiesModule,
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
