import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Artist } from '../../db/entities/artist.entity';
import { Genre } from '../../db/entities/genre.entity';
import { Label } from '../../db/entities/label.entity';
import { Release } from '../../db/entities/release.entity';
import { User } from '../../db/entities/user.entity';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Release, Artist, User, Label, Genre]),
    UsersModule,
    ImagesModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
