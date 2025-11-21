import { ArtistType } from 'shared';
import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { ArtistSubmission } from './artist-submission.entity';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReleaseArtist } from './release-artist.entity';

@Entity()
export class Artist extends SharedBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  nameLatin?: string;

  @Column('int', { default: ArtistType.Person })
  type: ArtistType;

  @Column({ nullable: true })
  disambiguation?: string;

  @Column({ nullable: true })
  members?: string;

  @Column({ nullable: true })
  membersSource?: string;

  @Column({ nullable: true })
  memberOf?: string;

  @Column({ nullable: true })
  memberOfSource?: string;

  @Column({ nullable: true })
  relatedArtists?: string;

  @Column({ nullable: true })
  relatedArtistsSource?: string;

  @Column({ nullable: true })
  aka?: string;

  @Column({ nullable: true })
  akaSource?: string;

  @OneToMany(() => ReleaseArtist, (ra) => ra.artist)
  releaseConnection: Promise<ReleaseArtist[]>;

  @OneToMany(() => ArtistSubmission, (as) => as.artist)
  artistSubmissions: ArtistSubmission[];

  @CreateDateColumn()
  createdAt: string;
}
