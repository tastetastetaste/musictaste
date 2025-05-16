import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { LabelSubmission } from '../../db/entities/label-submission.entity';
import { Label } from '../../db/entities/label.entity';
import { Language } from '../../db/entities/language.entity';
import { ReleaseSubmissionVote } from '../../db/entities/release-submission-vote.entity';
import { ReleaseSubmission } from '../../db/entities/release-submission.entity';
import { Release } from '../../db/entities/release.entity';
import { ImagesModule } from '../images/images.module';
import { LabelsModule } from '../labels/labels.module';
import { ReleasesModule } from '../releases/releases.module';
import { UsersModule } from '../users/users.module';
import { SubmissionService } from './submission.service';
import { SubmissionsController } from './submissions.controller';
import { LabelSubmissionVote } from '../../db/entities/label-submission-vote.entity';
import { ArtistSubmissionVote } from '../../db/entities/artist-submission-vote.entity';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Release,
      Artist,
      Label,
      Language,
      ReleaseSubmission,
      LabelSubmission,
      ArtistSubmission,
      ReleaseSubmissionVote,
      LabelSubmissionVote,
      ArtistSubmissionVote,
    ]),
    ReleasesModule,
    ImagesModule,
    UsersModule,
    LabelsModule,
    ArtistsModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
