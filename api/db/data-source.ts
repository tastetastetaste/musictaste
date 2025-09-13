import { ConfigService } from '@nestjs/config';
import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ArtistSubmission } from './entities/artist-submission.entity';
import { Artist } from './entities/artist.entity';
import { GenreSubmission } from './entities/genre-submission.entity';
import { Genre } from './entities/genre.entity';
import { LabelSubmission } from './entities/label-submission.entity';
import { Label } from './entities/label.entity';
import { Language } from './entities/language.entity';
import { ListComment } from './entities/list-comment.entity';
import { ListItem } from './entities/list-item.entity';
import { ListLike } from './entities/list-like.entity';
import { List } from './entities/list.entity';
import { Rating } from './entities/rating.entity';
import { ReleaseArtist } from './entities/release-artist.entity';
import { ReleaseGenreVote } from './entities/release-genre-vote.entity';
import { ReleaseGenre } from './entities/release-genre.entity';
import { ReleaseLabel } from './entities/release-label.entity';
import { ReleaseLanguage } from './entities/release-language.entity';
import { ReleaseSubmission } from './entities/release-submission.entity';
import { Release } from './entities/release.entity';
import { ReviewComment } from './entities/review-comment.entity';
import { ReviewVote } from './entities/review-vote.entity';
import { Review } from './entities/review.entity';
import { TrackVote } from './entities/track-vote.entity';
import { Track } from './entities/track.entity';
import { UserFollowing } from './entities/user-following.entity';
import { UserReleaseTag } from './entities/user-release-tag.entity';
import { UserRelease } from './entities/user-release.entity';
import { User } from './entities/user.entity';
import { ArtistSubmissionVote } from './entities/artist-submission-vote.entity';
import { GenreSubmissionVote } from './entities/genre-submission-vote.entity';
import { LabelSubmissionVote } from './entities/label-submission-vote.entity';
import { ReleaseSubmissionVote } from './entities/release-submission-vote.entity';

config();
const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  synchronize: false,
  logging: false,
  migrationsRun: true,
  // entities: ['build/compiled/db/entities/*.js'],
  // Include entities manually to avoid migration errors.
  entities: [
    ArtistSubmission,
    ArtistSubmissionVote,
    Artist,
    GenreSubmission,
    GenreSubmissionVote,
    Genre,
    LabelSubmission,
    LabelSubmissionVote,
    Label,
    Language,
    ListComment,
    ListItem,
    ListLike,
    List,
    Rating,
    ReleaseArtist,
    ReleaseGenreVote,
    ReleaseGenre,
    ReleaseLabel,
    ReleaseLanguage,
    ReleaseSubmission,
    ReleaseSubmissionVote,
    Release,
    ReviewComment,
    ReviewVote,
    Review,
    TrackVote,
    Track,
    UserFollowing,
    UserReleaseTag,
    UserRelease,
    User,
  ],
  migrations: ['dist/db/migration/*.js'],
  // subscribers: [],
};

export default new DataSource(dataSourceOptions);
