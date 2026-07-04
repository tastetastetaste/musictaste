import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { User } from '../../db/entities/user.entity';
import { UserCollectionView } from '../../db/entities/user-collection-view';
import { ImagesModule } from '../images/images.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { RedisModule } from '../redis/redis.module';
import { EntitiesModule } from '../entities/entities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFollowing, UserCollectionView]),
    ImagesModule,
    forwardRef(() => NotificationsModule),
    RedisModule,
    EntitiesModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
