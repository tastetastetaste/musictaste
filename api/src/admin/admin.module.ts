import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../db/entities/user.entity';
import { RedisModule } from '../redis/redis.module';
import { EntitiesModule } from '../entities/entities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ArtistsModule } from '../artists/artists.module';
import { ReleasesModule } from '../releases/releases.module';
import { LabelsModule } from '../labels/labels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    EntitiesModule,
    NotificationsModule,
    ArtistsModule,
    ReleasesModule,
    LabelsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
