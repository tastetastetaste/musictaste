import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { User } from './user.entity';
import { CommentEntityType } from 'shared';

@Entity()
@Index(['entityType', 'entityId'])
export class Comment extends SharedBaseEntity {
  @Column('text')
  body: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  entityId: string;

  @Column('int')
  entityType: CommentEntityType;

  @CreateDateColumn()
  createdAt: string;
}
