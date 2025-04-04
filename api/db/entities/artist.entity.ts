import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { ArtistSubmission } from './artist-submission.entity';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReleaseArtist } from './release-artist.entity';

@Entity()
export class Artist extends SharedBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => ReleaseArtist, (ra) => ra.artist)
  releaseConnection: Promise<ReleaseArtist[]>;

  @OneToMany(() => ArtistSubmission, (as) => as.artist)
  artistSubmissions: ArtistSubmission[];

  @CreateDateColumn()
  createdAt: string;
}
