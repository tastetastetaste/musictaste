import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { VoteType } from 'shared';
import { SharedBaseEntity } from '../shared/base-entity';
import { ReleaseGenre } from './release-genre.entity';
import { User } from './user.entity';

@Entity()
@Unique(['userId', 'releaseGenreId'])
export class ReleaseGenreVote extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  releaseGenreId: string;

  @Column('int')
  type: VoteType;

  @ManyToOne(() => ReleaseGenre, (rg) => rg.genreVotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseGenreId' })
  releaseGenre: ReleaseGenre;

  @ManyToOne(() => User, (user) => user.genreVotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: string;
}
