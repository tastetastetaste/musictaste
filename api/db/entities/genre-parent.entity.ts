import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Genre } from './genre.entity';

@Entity()
export class GenreParent {
  @PrimaryColumn()
  genreId: string;

  @PrimaryColumn()
  parentId: string;

  @ManyToOne(() => Genre, (genre) => genre.parentsConnection)
  @JoinColumn({ name: 'genreId' })
  genre: Promise<Genre>;

  @ManyToOne(() => Genre, (genre) => genre.childrenConnection)
  @JoinColumn({ name: 'parentId' })
  parent: Promise<Genre>;
}
