import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Artist } from './artist.entity';

@Entity()
export class RelatedArtist {
  @PrimaryColumn()
  sourceId: string;

  @PrimaryColumn()
  targetId: string;

  @ManyToOne(() => Artist, (artist) => artist.relatedTo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sourceId' })
  source: Artist;

  @ManyToOne(() => Artist, (artist) => artist.related, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'targetId' })
  target: Artist;
}
