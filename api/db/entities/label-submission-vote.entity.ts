import { VoteType } from 'shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { LabelSubmission } from './label-submission.entity';
import { User } from './user.entity';

@Entity()
export class LabelSubmissionVote extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  labelSubmissionId: string;

  @Column('int')
  type: VoteType;

  @ManyToOne(() => LabelSubmission, (label) => label.votes)
  @JoinColumn({ name: 'labelSubmissionId' })
  labelSubmission: LabelSubmission;

  @ManyToOne(() => User, (user) => user.labelSubmissionVotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: string;
}
