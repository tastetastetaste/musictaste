import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
  ArtistType,
  GroupArtistDto,
  SubmissionStatus,
  SubmissionType,
} from 'shared';
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
import { Type } from 'class-transformer';

export class ArtistChanges {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;

  @IsEnum(ArtistType)
  type: ArtistType;

  @IsString()
  @IsOptional()
  disambiguation?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  members?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  membersSource?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  memberOf?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  memberOfSource?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  relatedArtists?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  relatedArtistsSource?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  aka?: string;

  // @deprecated
  @IsString()
  @IsOptional()
  akaSource?: string;

  @IsString()
  @IsOptional()
  mainArtistId?: string;

  @Type(() => GroupArtistDto)
  @IsOptional()
  groupArtists: GroupArtistDto[];

  @IsString({ each: true })
  @IsOptional()
  relatedArtistsIds: string[];
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
