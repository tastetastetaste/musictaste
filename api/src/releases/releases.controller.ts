import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindReleasesDto, IReleaseResponse, IReleasesResponse } from 'shared';
import { ReleasesService } from './releases.service';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get()
  find(@Query() query: FindReleasesDto): Promise<IReleasesResponse> {
    return this.releasesService.find(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IReleaseResponse> {
    return this.releasesService.findOne(id);
  }
}
