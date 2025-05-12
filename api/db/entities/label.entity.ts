import { Entity, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { LabelSubmission } from './label-submission.entity';
import { ReleaseLabel } from './release-label.entity';
import { LabelStatus } from 'shared';

@Entity()
export class Label extends SharedBaseEntity {
  @Column()
  name: string;

  @Column('int', { default: LabelStatus.ACTIVE })
  status: LabelStatus;

  @OneToMany(() => ReleaseLabel, (rl) => rl.label)
  releaseConnection: Promise<ReleaseLabel[]>;

  @OneToMany(() => LabelSubmission, (ls) => ls.label)
  labelSubmissions: LabelSubmission[];

  @CreateDateColumn()
  createdAt: string;
}
