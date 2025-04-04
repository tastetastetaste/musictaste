import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  Unique,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { List } from './list.entity';
import { User } from './user.entity';

@Entity()
@Unique(['userId', 'listId'])
export class ListLike extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  listId: string;

  @ManyToOne(() => User, (user) => user.listsLikes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => List, (list) => list.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'listId' })
  list: List;

  @CreateDateColumn()
  createdAt: string;
}
