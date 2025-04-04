import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { UserRelease } from './user-release.entity';
import { User } from './user.entity';

@Entity()
export class UserReleaseTag extends SharedBaseEntity {
  @Column()
  tag: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.entriesTags)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => UserRelease, (ur) => ur.tags, {
    onDelete: 'CASCADE',
  })
  entries: UserRelease[];
}
