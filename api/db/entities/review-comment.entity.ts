import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Review } from './review.entity';
import { User } from './user.entity';

@Entity()
export class ReviewComment extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  reviewId: string;

  @Column('text')
  body: string;

  @ManyToOne(() => User, (user) => user.reviewsComments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Review, (review) => review.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @CreateDateColumn()
  createdAt: string;
}
