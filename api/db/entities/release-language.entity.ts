import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Language } from './language.entity';
import { Release } from './release.entity';

@Entity()
export class ReleaseLanguage {
  @PrimaryColumn()
  languageId: string;

  @PrimaryColumn()
  releaseId: string;

  @ManyToOne(() => Language, (language) => language.releaseConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'languageId' })
  language: Language;

  @ManyToOne(() => Release, (release) => release.languageConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;
}
