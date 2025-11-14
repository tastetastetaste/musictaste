import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleasesModule } from '../releases/releases.module';
import { UsersModule } from '../users/users.module';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { ListItem } from '../../db/entities/list-item.entity';
import { ListLike } from '../../db/entities/list-like.entity';
import { List } from '../../db/entities/list.entity';
import { ImagesModule } from '../images/images.module';
import { CommentsModule } from '../comments/comments.module';
import { EntitiesModule } from '../entities/entities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([List, ListItem, ListLike]),
    ReleasesModule,
    UsersModule,
    ImagesModule,
    CommentsModule,
    EntitiesModule,
  ],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
