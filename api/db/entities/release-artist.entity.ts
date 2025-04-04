import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Artist } from './artist.entity';
import { Release } from './release.entity';

@Entity()
export class ReleaseArtist {
  @PrimaryColumn()
  artistId: string;

  @PrimaryColumn()
  releaseId: string;

  @ManyToOne(() => Artist, (artist) => artist.releaseConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @ManyToOne(() => Release, (release) => release.artistConnection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;
}
