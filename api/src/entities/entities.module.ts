import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../db/entities/user.entity';
import { List } from '../../db/entities/list.entity';
import { Release } from '../../db/entities/release.entity';
import { UserRelease } from '../../db/entities/user-release.entity';
import { UserReleaseTag } from '../../db/entities/user-release-tag.entity';
import { ReviewVote } from '../../db/entities/review-vote.entity';
import { ListLike } from '../../db/entities/list-like.entity';
import { Comment } from '../../db/entities/comment.entity';
import { Notification } from '../../db/entities/notification.entity';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { ReleaseGenreVote } from '../../db/entities/release-genre-vote.entity';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { ReleaseSubmission } from '../../db/entities/release-submission.entity';
import { LabelSubmission } from '../../db/entities/label-submission.entity';
import { Track } from '../../db/entities/track.entity';
import { ListItem } from '../../db/entities/list-item.entity';
import { TrackVote } from '../../db/entities/track-vote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRelease,
      List,
      ListItem,
      Release,
      UserReleaseTag,
      ReviewVote,
      ListLike,
      Comment,
      Notification,
      UserFollowing,
      ReleaseGenreVote,
      ArtistSubmission,
      ReleaseSubmission,
      LabelSubmission,
      Track,
      TrackVote,
    ]),
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
