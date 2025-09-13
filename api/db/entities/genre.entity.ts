import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { GenreSubmission } from './genre-submission.entity';
import { ReleaseGenre } from './release-genre.entity';

@Entity()
export class Genre extends SharedBaseEntity {
  @Column()
  name: string;

  @Column('text', { nullable: true })
  bio: string;

  @OneToMany(() => ReleaseGenre, (rg) => rg.genre)
  releaseConnection: Promise<ReleaseGenre[]>;

  @OneToMany(() => GenreSubmission, (gs) => gs.genre)
  genreSubmissions: GenreSubmission[];
  @CreateDateColumn()
  createdAt: string;
}
