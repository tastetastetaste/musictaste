import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { User } from '../../db/entities/user.entity';
import { ImagesModule } from '../images/images.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFollowing]),
    ImagesModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
