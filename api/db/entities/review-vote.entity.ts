import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  Unique,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Review } from './review.entity';
import { User } from './user.entity';
import { VoteType } from 'shared';

@Entity()
@Unique(['userId', 'reviewId'])
export class ReviewVote extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  reviewId: string;

  @ManyToOne(() => User, (user) => user.reviewsVotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Review, (review) => review.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column('int')
  vote: VoteType;

  @CreateDateColumn()
  createdAt: string;
}
