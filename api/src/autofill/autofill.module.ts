import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutofillController } from './autofill.controller';
import { AutofillService } from './autofill.service';
import { Artist } from '../../db/entities/artist.entity';
import { Label } from '../../db/entities/label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Label])],
  controllers: [AutofillController],
  providers: [AutofillService],
})
export class AutofillModule {}
