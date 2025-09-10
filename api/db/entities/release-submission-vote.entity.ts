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
import { ReleaseSubmission } from './release-submission.entity';
import { User } from './user.entity';

@Entity()
@Unique(['userId', 'releaseSubmissionId'])
export class ReleaseSubmissionVote extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  releaseSubmissionId: string;

  @Column('int')
  type: VoteType;

  @ManyToOne(() => ReleaseSubmission, (release) => release.votes)
  @JoinColumn({ name: 'releaseSubmissionId' })
  releaseSubmission: ReleaseSubmission;

  @ManyToOne(() => User, (user) => user.releaseSubmissionVotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: string;
}
