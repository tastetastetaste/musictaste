import { ArtistType } from 'shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ArtistSubmission } from './artist-submission.entity';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReleaseArtist } from './release-artist.entity';
import { GroupArtist } from './group-artist.entity';
import { RelatedArtist } from './related-artist.entity';
import { Country } from './country.entity';

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

  // @deprecated
  @Column({ nullable: true })
  members?: string;

  // @deprecated
  @Column({ nullable: true })
  membersSource?: string;

  // @deprecated
  @Column({ nullable: true })
  memberOf?: string;

  // @deprecated
  @Column({ nullable: true })
  memberOfSource?: string;

  // @deprecated
  @Column({ nullable: true })
  relatedArtists?: string;

  // @deprecated
  @Column({ nullable: true })
  relatedArtistsSource?: string;

  // @deprecated
  @Column({ nullable: true })
  aka?: string;

  // @deprecated
  @Column({ nullable: true })
  akaSource?: string;

  @Column({ nullable: true })
  mainArtistId?: string;

  @Column({ nullable: true })
  countryId?: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId' })
  country?: Country;

  @ManyToOne(() => Artist, (artist) => artist.aliases, { nullable: true })
  @JoinColumn({ name: 'mainArtistId' })
  mainArtist?: Artist;

  @OneToMany(() => Artist, (artist) => artist.mainArtist)
  aliases: Artist[];

  @OneToMany(() => GroupArtist, (ga) => ga.artist)
  groups: GroupArtist[];

  @OneToMany(() => GroupArtist, (ga) => ga.group)
  groupArtists: GroupArtist[];

  @OneToMany(() => RelatedArtist, (ra) => ra.source)
  relatedTo: RelatedArtist[];

  @OneToMany(() => RelatedArtist, (ra) => ra.target)
  related: RelatedArtist[];

  @OneToMany(() => ReleaseArtist, (ra) => ra.artist)
  releaseConnection: Promise<ReleaseArtist[]>;

  @OneToMany(() => ArtistSubmission, (as) => as.artist)
  artistSubmissions: ArtistSubmission[];

  @CreateDateColumn()
  createdAt: string;
}
