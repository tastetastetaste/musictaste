import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { GenreSubmission } from './genre-submission.entity';
import { ReleaseGenre } from './release-genre.entity';
import { GenreParent } from './genre-parent.entity';

@Entity()
export class Genre extends SharedBaseEntity {
  @Column()
  name: string;

  @Column('text', { nullable: true })
  bio: string;

  // @deprecated
  @Column('text', { nullable: true })
  bioSource: string;

  @OneToMany(() => ReleaseGenre, (rg) => rg.genre)
  releaseConnection: Promise<ReleaseGenre[]>;

  @OneToMany(() => GenreSubmission, (gs) => gs.genre)
  genreSubmissions: GenreSubmission[];
  @CreateDateColumn()
  createdAt: string;

  @OneToMany(() => GenreParent, (gp) => gp.genre)
  parentsConnection: Promise<GenreParent[]>;

  @OneToMany(() => GenreParent, (gp) => gp.parent)
  childrenConnection: Promise<GenreParent[]>;
}
