import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItem } from '../../db/entities/list-item.entity';
import { ReleasesModule } from '../releases/releases.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListItem]), ReleasesModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
