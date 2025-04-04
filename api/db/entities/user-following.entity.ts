import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { User } from './user.entity';

@Entity()
@Unique(['followerId', 'followingId'])
export class UserFollowing extends SharedBaseEntity {
  @Column()
  followerId: string;

  @Column()
  followingId: string;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'followerId' })
  follower: Promise<User>;

  @ManyToOne(() => User, (user) => user.following)
  @JoinColumn({ name: 'followingId' })
  following: Promise<User>;

  @CreateDateColumn()
  createdAt: string;
}
