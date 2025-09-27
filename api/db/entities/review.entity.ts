import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReviewVote } from './review-vote.entity';
import { UserRelease } from './user-release.entity';

@Entity()
export class Review extends SharedBaseEntity {
  @OneToOne(() => UserRelease, (r) => r.review, {
    onDelete: 'CASCADE',
  })
  ur: UserRelease;

  @Column('text')
  body: string;

  @OneToMany(() => ReviewVote, (rc) => rc.review)
  votes: ReviewVote[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
