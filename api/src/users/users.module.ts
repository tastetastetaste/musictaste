import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { ReleasesModule } from '../releases/releases.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserFollowing } from '../../db/entities/user-following.entity';
import { User } from '../../db/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFollowing]),
    forwardRef(() => ReleasesModule),
    ImagesModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
