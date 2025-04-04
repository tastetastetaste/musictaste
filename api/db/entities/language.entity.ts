import { Entity, Column, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReleaseLanguage } from './release-language.entity';

@Entity()
export class Language extends SharedBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => ReleaseLanguage, (rl) => rl.language)
  releaseConnection: Promise<ReleaseLanguage[]>;
}
