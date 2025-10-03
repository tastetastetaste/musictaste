import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import {
  ContributorStatus,
  ExplicitCoverArt,
  SupporterStatus,
  UpdateUserThemeDto,
} from 'shared';
import { ArtistSubmission } from './artist-submission.entity';
import { SharedBaseEntity } from '../shared/base-entity';
import { GenreSubmission } from './genre-submission.entity';
import { LabelSubmission } from './label-submission.entity';
import { ListLike } from './list-like.entity';
import { List } from './list.entity';
import { ReleaseGenreVote } from './release-genre-vote.entity';
import { ReleaseSubmission } from './release-submission.entity';
import { ReviewVote } from './review-vote.entity';
import { UserFollowing } from './user-following.entity';
import { UserReleaseTag } from './user-release-tag.entity';
import { UserRelease } from './user-release.entity';
import { ArtistSubmissionVote } from './artist-submission-vote.entity';
import { ReleaseSubmissionVote } from './release-submission-vote.entity';
import { LabelSubmissionVote } from './label-submission-vote.entity';
import { GenreSubmissionVote } from './genre-submission-vote.entity';
import { Comment } from './comment.entity';
import { Notification } from './notification.entity';

@Entity()
export class User extends SharedBaseEntity {
  @Index({ unique: true })
  @Column()
  username: string;

  @Column()
  name: string;

  @Column({ unique: true, select: false })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text', { nullable: true })
  imagePath: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('int', { default: ContributorStatus.CONTRIBUTOR })
  contributorStatus: ContributorStatus;

  @Column('boolean', { default: false })
  confirmed: boolean;

  @Column('simple-array', { nullable: true })
  allowExplicitCoverArt?: ExplicitCoverArt[];

  @Column('int', { default: SupporterStatus.NOT_A_SUPPORTER })
  supporter: SupporterStatus;

  @Column('timestamp', { nullable: true })
  supporterStartDate: string;

  @Column('simple-json', { nullable: true })
  theme: UpdateUserThemeDto;

  @OneToMany(() => UserRelease, (ur) => ur.user)
  entries: UserRelease[];

  @OneToMany(() => UserReleaseTag, (urt) => urt.user)
  entriesTags: UserReleaseTag[];

  @OneToMany(() => List, (list) => list.user)
  lists: List[];

  @OneToMany(() => ReviewVote, (rl) => rl.user)
  reviewsVotes: ReviewVote[];

  @OneToMany(() => ListLike, (rl) => rl.user)
  listsLikes: ListLike[];

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  // Notifications
  @OneToMany(() => Notification, (n) => n.user)
  sentNotifications: Notification[];

  @OneToMany(() => Notification, (n) => n.notify)
  notifications: Notification[];

  @OneToMany(() => UserFollowing, (uf) => uf.follower)
  following: UserFollowing[];

  @OneToMany(() => UserFollowing, (uf) => uf.following)
  followers: UserFollowing[];

  @OneToMany(() => ArtistSubmission, (as) => as.user)
  artistSubmissions: ArtistSubmission[];

  @OneToMany(() => ReleaseSubmission, (rs) => rs.user)
  releaseSubmissions: ReleaseSubmission[];

  @OneToMany(() => LabelSubmission, (ls) => ls.user)
  labelSubmissions: LabelSubmission[];

  @OneToMany(() => GenreSubmission, (gs) => gs.user)
  genreSubmissions: GenreSubmission[];

  @OneToMany(() => ReleaseGenreVote, (rgv) => rgv.user)
  genreVotes: ReleaseGenreVote[];

  @OneToMany(() => ArtistSubmissionVote, (vote) => vote.user)
  artistSubmissionVotes: ArtistSubmissionVote[];

  @OneToMany(() => ReleaseSubmissionVote, (vote) => vote.user)
  releaseSubmissionVotes: ReleaseSubmissionVote[];

  @OneToMany(() => LabelSubmissionVote, (vote) => vote.user)
  labelSubmissionVotes: LabelSubmissionVote[];

  @OneToMany(() => GenreSubmissionVote, (vote) => vote.user)
  genreSubmissionVotes: GenreSubmissionVote[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
