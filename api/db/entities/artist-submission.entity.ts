import { IsString, IsOptional } from 'class-validator';
import { SubmissionStatus, SubmissionType } from 'shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { ArtistSubmissionVote } from './artist-submission-vote.entity';
import { Artist } from './artist.entity';
import { User } from './user.entity';

export class ArtistChanges {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;
}

@Entity()
export class ArtistSubmission extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column('varchar', { nullable: true })
  artistId: string;

  @Column('simple-json')
  changes: ArtistChanges;

  @Column('simple-json', { nullable: true })
  original: ArtistChanges;

  @Column('int')
  submissionType: SubmissionType;

  @Column('int')
  submissionStatus: SubmissionStatus;

  @ManyToOne(() => Artist, (artist) => artist.artistSubmissions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @ManyToOne(() => User, (user) => user.artistSubmissions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ArtistSubmissionVote, (vote) => vote.artistSubmission)
  votes: ArtistSubmissionVote[];

  @Column('text', { nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: string;
}
