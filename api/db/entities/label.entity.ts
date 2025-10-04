import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { LabelSubmission } from './label-submission.entity';
import { ReleaseLabel } from './release-label.entity';

@Entity()
export class Label extends SharedBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  nameLatin?: string;

  @OneToMany(() => ReleaseLabel, (rl) => rl.label)
  releaseConnection: Promise<ReleaseLabel[]>;

  @OneToMany(() => LabelSubmission, (ls) => ls.label)
  labelSubmissions: LabelSubmission[];

  @CreateDateColumn()
  createdAt: string;
}
