import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Rating } from './rating.entity';
import { Release } from './release.entity';
import { Review } from './review.entity';
import { TrackVote } from './track-vote.entity';
import { UserReleaseTag } from './user-release-tag.entity';
import { User } from './user.entity';

@Entity()
@Unique(['releaseId', 'userId'])
export class UserRelease extends SharedBaseEntity {
  @Column()
  releaseId: string;

  @Column()
  userId: string;

  @ManyToOne(() => Release, (release) => release.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;

  @ManyToOne(() => User, (user) => user.entries)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  reviewId: string | undefined;

  @OneToOne(() => Review, (r) => r.ur, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column({ nullable: true })
  ratingId: string | undefined;

  @OneToOne(() => Rating, (r) => r.ur, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn({ name: 'ratingId' })
  rating: Rating;

  @Column('boolean', { default: false })
  hasTrackVotes: boolean;

  @OneToMany(() => TrackVote, (rc) => rc.userRelease)
  trackVotes: TrackVote[];

  @ManyToMany(() => UserReleaseTag, (tag) => tag.entries, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_release_user_tag',
    joinColumn: {
      name: 'user_release_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_release_tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: UserReleaseTag[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
