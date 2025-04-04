import { VoteType } from 'shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { ArtistSubmission } from './artist-submission.entity';
import { User } from './user.entity';

@Entity()
export class ArtistSubmissionVote extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  artistSubmissionId: string;

  @Column('int')
  type: VoteType;

  @ManyToOne(() => ArtistSubmission, (artist) => artist.votes)
  @JoinColumn({ name: 'artistSubmissionId' })
  artistSubmission: ArtistSubmission;

  @ManyToOne(() => User, (user) => user.artistSubmissionVotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: string;
}
