import { Column, Entity, OneToMany } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { Artist } from './artist.entity';

@Entity()
export class Country extends SharedBaseEntity {
  @Column()
  name: string;

  @Column()
  region: string;

  @OneToMany(() => Artist, (artist) => artist.country)
  artists: Artist[];
}
