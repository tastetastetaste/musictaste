import { IsString } from 'class-validator';
import { SubmissionStatus, SubmissionType } from 'shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Genre } from './genre.entity';
import { User } from './user.entity';

export class GenreChanges {
  @IsString()
  name: string;
}

@Entity()
export class GenreSubmission extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column({ nullable: true })
  genreId: string;

  @Column('text')
  changes: GenreChanges;

  @Column('simple-json', { nullable: true })
  original: GenreChanges;

  @Column('int')
  submissionType: SubmissionType;

  @Column('int')
  submissionStatus: SubmissionStatus;

  @ManyToOne(() => Genre, (genre) => genre.genreSubmissions)
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @ManyToOne(() => User, (user) => user.genreSubmissions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: string;
}
