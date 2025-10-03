import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../db/entities/user.entity';
import { List } from '../../db/entities/list.entity';
import { Release } from '../../db/entities/release.entity';
import { UserRelease } from '../../db/entities/user-release.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRelease, List, Release])],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
