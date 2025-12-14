import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Artist } from './artist.entity';

@Entity()
export class GroupArtist {
  @PrimaryColumn()
  groupId: string;

  @PrimaryColumn()
  artistId: string;

  @ManyToOne(() => Artist, (artist) => artist.groupArtists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Artist;

  @ManyToOne(() => Artist, (artist) => artist.groups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column({ default: true })
  current: boolean;

  @CreateDateColumn()
  createdAt: string;
}
