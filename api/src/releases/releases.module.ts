import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { ReleaseLanguage } from '../../db/entities/release-language.entity';
import { ReleaseSubmission } from '../../db/entities/release-submission.entity';
import { Release } from '../../db/entities/release.entity';
import { Track } from '../../db/entities/track.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from '../users/users.module';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { CommentsModule } from '../comments/comments.module';
import { EntitiesModule } from '../entities/entities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Release,
      Artist,
      UserRelease,
      ReleaseArtist,
      ReleaseLabel,
      ReleaseLanguage,
      Track,
      ReleaseSubmission,
      ReleaseGenre,
    ]),
    UsersModule,
    ImagesModule,
    CommentsModule,
    EntitiesModule,
  ],
  controllers: [ReleasesController],
  providers: [ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
