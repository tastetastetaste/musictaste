import { CreateArtistDto, IArtistResponse } from 'shared';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IArtistResponse> {
    return this.artistsService.findOneWithReleases(id);
  }
}
