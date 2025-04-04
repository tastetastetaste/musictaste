import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Genre } from './genre.entity';
import { ReleaseGenreVote } from './release-genre-vote.entity';
import { Release } from './release.entity';

@Entity()
@Unique(['genreId', 'releaseId'])
export class ReleaseGenre extends SharedBaseEntity {
  @Column()
  genreId: string;

  @Column()
  releaseId: string;

  @ManyToOne(() => Genre, (genre) => genre.releaseConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @ManyToOne(() => Release, (release) => release.genreConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;

  @Column('float')
  votesAvg: number;

  @Column('int')
  votesCount: number;

  @OneToMany(() => ReleaseGenreVote, (rgv) => rgv.releaseGenre)
  genreVotes: ReleaseGenreVote[];
}
