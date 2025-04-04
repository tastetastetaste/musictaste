import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Label } from './label.entity';
import { Release } from './release.entity';

@Entity()
export class ReleaseLabel {
  @PrimaryColumn()
  labelId: string;

  @PrimaryColumn()
  releaseId: string;

  @ManyToOne(() => Label, (label) => label.releaseConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'labelId' })
  label: Promise<Label>;

  @ManyToOne(() => Release, (release) => release.labelConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Promise<Release>;
}
