import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
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
}

@Entity()
export class ArtistSubmission extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column('varchar', { nullable: true })
  artistId: string;

  @Column('simple-json')
  @Transform((value) => JSON.stringify(value), { toPlainOnly: true })
  @Transform((value: any) => JSON.parse(value), { toClassOnly: true })
  @Type(() => ArtistChanges)
  changes: ArtistChanges;

  @Column('int')
  submissionType: SubmissionType;

  @Column('int')
  submissionStatus: SubmissionStatus;

  @ManyToOne(() => Artist, (artist) => artist.artistSubmissions)
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
