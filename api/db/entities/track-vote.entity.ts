import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  Unique,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Track } from './track.entity';
import { UserRelease } from './user-release.entity';
import { VoteType } from 'shared';

@Entity()
@Unique(['userReleaseId', 'trackId'])
export class TrackVote extends SharedBaseEntity {
  @Column()
  trackId: string;

  @Column()
  userReleaseId: string;

  @ManyToOne(() => Track, (track) => track.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @ManyToOne(() => UserRelease, (ur) => ur.trackVotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userReleaseId' })
  userRelease: UserRelease;

  @Column('int')
  vote: VoteType;

  @CreateDateColumn()
  createdAt: string;
}
