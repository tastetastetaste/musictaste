import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SharedBaseEntity } from '../shared/base-entity';
import { User } from './user.entity';
import { NotificationType } from 'shared';

@Entity()
@Index(['notifyId', 'read'])
@Index(['notifyId', 'createdAt'])
export class Notification extends SharedBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  user: User; // User who triggered the notification

  @Index()
  @Column()
  notifyId: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'notifyId' })
  notify: User; // User who receives the notification

  @Column('int')
  notificationType: NotificationType;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  link?: string;

  @Column('boolean', { default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: string;
}
