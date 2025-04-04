import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { List } from './list.entity';
import { User } from './user.entity';

@Entity()
export class ListComment extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  listId: string;

  @Column('text')
  body: string;

  @ManyToOne(() => User, (user) => user.listsComments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => List, (list) => list.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'listId' })
  list: List;

  @CreateDateColumn()
  createdAt: string;
}
