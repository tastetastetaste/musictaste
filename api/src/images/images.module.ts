import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';

@Module({
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
