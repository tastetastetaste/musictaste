import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { IArtistResponse, IArtistSummary } from 'shared';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 5) // 5 minutes
  findMany(@Query('ids') ids: string): Promise<IArtistSummary[]> {
    const idArray = ids ? ids.split(',') : [];
    return this.artistsService.findByIds(idArray);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 5) // 5 minutes
  findOne(@Param('id') id: string): Promise<IArtistResponse> {
    return this.artistsService.findOne(id);
  }
}

