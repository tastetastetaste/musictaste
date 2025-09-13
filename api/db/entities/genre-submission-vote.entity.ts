import { VoteType } from 'shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { User } from './user.entity';
import { GenreSubmission } from './genre-submission.entity';

@Entity()
@Unique(['userId', 'genreSubmissionId'])
export class GenreSubmissionVote extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  genreSubmissionId: string;

  @Column('int')
  type: VoteType;

  @ManyToOne(() => GenreSubmission, (genre) => genre.votes)
  @JoinColumn({ name: 'genreSubmissionId' })
  genreSubmission: GenreSubmission;

  @ManyToOne(() => User, (user) => user.genreSubmissionVotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: string;
}
