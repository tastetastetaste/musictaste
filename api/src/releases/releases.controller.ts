import { Controller, Get, Param, Query } from '@nestjs/common';
import { IReleaseResponse, IReleasesResponse } from 'shared';
import {
  FindChartDto,
  FindNewReleasesDto,
  FindPopularDto,
  FindRecentlyAddedDto,
} from './dto/find-releases.dto';
import { ReleasesService } from './releases.service';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get('new')
  findNew(@Query() query: FindNewReleasesDto): Promise<IReleasesResponse> {
    return this.releasesService.findNew(query);
  }

  @Get('popular')
  findPopular(@Query() query: FindPopularDto): Promise<IReleasesResponse> {
    return this.releasesService.findPopular(query);
  }

  @Get('top')
  findTop(@Query() query: FindChartDto): Promise<IReleasesResponse> {
    return this.releasesService.findTop(query);
  }

  @Get('recent')
  findRecent(@Query() query: FindRecentlyAddedDto): Promise<IReleasesResponse> {
    return this.releasesService.findRecentlyAdded(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IReleaseResponse> {
    return this.releasesService.findOne(id);
  }
}
