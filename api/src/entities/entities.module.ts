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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRelease,
      List,
      Release,
      UserReleaseTag,
      ReviewVote,
      ListLike,
      Comment,
      Notification,
      UserFollowing,
      ReleaseGenreVote,
    ]),
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
