import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Release } from './release.entity';
import { User } from './user.entity';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReleaseType, SubmissionStatus, SubmissionType } from 'shared';
import { ReleaseSubmissionVote } from './release-submission-vote.entity';

class TrackChanges {
  track: string;
  title: string;
  durationMs?: number;
}

export class ReleaseChanges {
  @IsString()
  title: string;

  @IsEnum(ReleaseType)
  type: ReleaseType;

  @IsString()
  @IsOptional()
  date: string;

  @IsString({ each: true })
  @IsOptional()
  artistsIds: string[];

  @IsString({ each: true })
  @IsOptional()
  labelsIds: string[];

  @IsString({ each: true })
  @IsOptional()
  languagesIds: string[];

  @IsString()
  @IsOptional()
  imagePath: string;

  @Type(() => TrackChanges)
  @IsOptional()
  tracks: TrackChanges[];
}

@Entity()
export class ReleaseSubmission extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column({ nullable: true })
  releaseId: string;

  @Column('simple-json')
  changes: ReleaseChanges;

  @Column('int')
  submissionType: SubmissionType;

  @Column('int')
  submissionStatus: SubmissionStatus;

  @ManyToOne(() => Release, (release) => release.releaseSubmissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;

  @ManyToOne(() => User, (user) => user.releaseSubmissions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ReleaseSubmissionVote, (vote) => vote.releaseSubmission)
  votes: ReleaseSubmissionVote[];

  @Column('text', { nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: string;
}
