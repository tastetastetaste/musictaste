import { DatePrecision, ExplicitCoverArt, ReleaseType } from 'shared';
import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { ListItem } from './list-item.entity';
import { ReleaseArtist } from './release-artist.entity';
import { ReleaseGenre } from './release-genre.entity';
import { ReleaseLabel } from './release-label.entity';
import { ReleaseLanguage } from './release-language.entity';
import { ReleaseSubmission } from './release-submission.entity';
import { Track } from './track.entity';
import { UserRelease } from './user-release.entity';

@Entity()
export class Release extends SharedBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  titleLatin?: string;

  @Column('int')
  type: ReleaseType;

  @Column('date', { nullable: true })
  date: string;

  @Column('int', { default: DatePrecision.DAY })
  datePrecision: number;

  @Column('text', { nullable: true })
  imagePath: string;

  @Column('simple-array', { nullable: true })
  explicitCoverArt?: ExplicitCoverArt[];

  @OneToMany(() => ReleaseArtist, (ra) => ra.release)
  artistConnection: ReleaseArtist[];

  @OneToMany(() => ReleaseLabel, (rl) => rl.release)
  labelConnection: ReleaseLabel[];

  @OneToMany(() => ReleaseLanguage, (rl) => rl.release)
  languageConnection: ReleaseLanguage[];

  @OneToMany(() => ReleaseSubmission, (as) => as.release)
  releaseSubmissions: ReleaseSubmission[];

  @OneToMany(() => ReleaseGenre, (rg) => rg.release)
  genreConnection: ReleaseGenre[];

  @OneToMany(() => Track, (track) => track.release)
  tracks: Track[];

  @OneToMany(() => UserRelease, (ur) => ur.release)
  entries: UserRelease[];

  @OneToMany(() => ListItem, (li) => li.release)
  lists: ListItem[];

  @CreateDateColumn()
  createdAt: string;
}
