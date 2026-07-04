import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RatingFilterEnum, YearFilterEnum, MultiValueFilterEnum } from 'shared';
import { SharedBaseEntity } from '../shared/base-entity';
import { User } from './user.entity';

export class UserCollectionViewFilters {
  rating?: RatingFilterEnum;
  ratingIs?: number; // is
  ratingStart?: number; // isgreaterthan, inrange
  ratingEnd?: number; // islessthan, inrange

  year?: YearFilterEnum;
  yearIs?: string;
  yearStart?: string; // isafter, inrange
  yearEnd?: string; // isbefore, in range

  type?: MultiValueFilterEnum;
  typeValues?: number[]; // isanyof, isnotanyof

  artist?: MultiValueFilterEnum;
  artistValues?: string[];

  genre?: MultiValueFilterEnum;
  genreValues?: string[];

  label?: MultiValueFilterEnum;
  labelValues?: string[];

  country?: MultiValueFilterEnum;
  countryValues?: string[];

  tag?: MultiValueFilterEnum;
  tagValues?: string[];
}

@Entity()
export class UserCollectionView extends SharedBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.collectionViews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column()
  order: number;

  @Column('simple-json')
  filters: UserCollectionViewFilters;
}
