import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { ListItem } from './list-item.entity';
import { ListLike } from './list-like.entity';
import { User } from './user.entity';

@Entity()
export class List extends SharedBaseEntity {
  @Column()
  userId: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('boolean', { default: false })
  ranked: boolean;

  @Column('boolean', { default: false })
  grid: boolean;

  @ManyToOne(() => User, (user) => user.lists)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ListItem, (li) => li.list)
  items: ListItem[];

  @OneToMany(() => ListLike, (ll) => ll.list)
  likes: ListLike[];

  @Column('boolean', { default: false })
  published: boolean;

  @Column('timestamp', { nullable: true })
  publishedDate: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
