import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { Label } from '../../db/entities/label.entity';
import { ReleaseLabel } from '../../db/entities/release-label.entity';
import { ReleasesModule } from '../releases/releases.module';

@Module({
  imports: [TypeOrmModule.forFeature([Label, ReleaseLabel]), ReleasesModule],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}
