import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleasesModule } from '../releases/releases.module';
import { UsersModule } from '../users/users.module';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { EntitiesModule } from '../entities/entities.module';
import { Rating } from '../../db/entities/rating.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { ReleaseGenre } from '../../db/entities/release-genre.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { ReviewVote } from '../../db/entities/review-vote.entity';
import { Review } from '../../db/entities/review.entity';
import { TrackVote } from '../../db/entities/track-vote.entity';
import { Track } from '../../db/entities/track.entity';
import { UserReleaseTag } from '../../db/entities/user-release-tag.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRelease,
      Rating,
      Review,
      ReviewVote,
      ReleaseArtist,
      ReleaseGenre,
      ReleaseLabel,
      UserReleaseTag,
      Track,
      TrackVote,
    ]),
    ReleasesModule,
    UsersModule,
    CommentsModule,
    EntitiesModule,
  ],
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
