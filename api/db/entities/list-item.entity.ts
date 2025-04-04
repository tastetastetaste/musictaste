import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { List } from './list.entity';
import { Release } from './release.entity';

@Entity()
export class ListItem extends SharedBaseEntity {
  @Column()
  listId: string;

  @Column()
  releaseId: string;

  @Column('int')
  index: number;

  @Column('text', { nullable: true })
  note: string;

  @ManyToOne(() => List, (list) => list.items, {
    onDelete: 'CASCADE',
  })
  list: List;

  @ManyToOne(() => Release, (release) => release.lists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'releaseId' })
  release: Release;

  @CreateDateColumn()
  createdAt: string;
}
