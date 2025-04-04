import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Release } from './release.entity';
import { TrackVote } from './track-vote.entity';

@Entity()
export class Track extends SharedBaseEntity {
  @Column()
  releaseId: string;

  // track || disc-track
  @Column()
  track: string;

  @Column('int')
  order: number;

  @Column()
  title: string;

  @ManyToOne(() => Release, (release) => release.tracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;

  @OneToMany(() => TrackVote, (rc) => rc.track)
  votes: TrackVote[];

  @Column('int', { nullable: true })
  durationMs?: number;
}
