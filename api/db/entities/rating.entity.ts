import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Check,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { UserRelease } from './user-release.entity';

@Entity()
@Check(`"rating" >= 0 AND "rating" <= 100`)
export class Rating extends SharedBaseEntity {
  @OneToOne(() => UserRelease, (r) => r.rating)
  ur: UserRelease;

  @Column('int')
  rating: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
