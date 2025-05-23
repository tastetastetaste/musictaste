import { Transform, Type } from 'class-transformer';
import { IsString } from 'class-validator';
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
import { Label } from './label.entity';
import { User } from './user.entity';
import { LabelSubmissionVote } from './label-submission-vote.entity';

export class LabelChanges {
  @IsString()
  name: string;
}

@Entity()
export class LabelSubmission extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column({ nullable: true })
  labelId: string;

  @Column('simple-json')
  @Transform((value) => JSON.stringify(value), { toPlainOnly: true })
  @Transform((value: any) => JSON.parse(value), { toClassOnly: true })
  @Type(() => LabelChanges)
  changes: LabelChanges;

  @Column('int')
  submissionType: SubmissionType;

  @Column('int')
  submissionStatus: SubmissionStatus;

  @ManyToOne(() => Label, (label) => label.labelSubmissions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'labelId' })
  label: Label;

  @ManyToOne(() => User, (user) => user.labelSubmissions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => LabelSubmissionVote, (vote) => vote.labelSubmission)
  votes: LabelSubmissionVote[];

  @Column('text', { nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: string;
}
