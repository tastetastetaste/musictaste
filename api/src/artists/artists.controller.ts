import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { IArtistResponse } from 'shared';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 5) // 5 minutes
  findOne(@Param('id') id: string): Promise<IArtistResponse> {
    return this.artistsService.findOne(id);
  }
}
