import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { FindReleasesDto, IReleaseResponse, IReleasesResponse } from 'shared';
import { ReleasesService } from './releases.service';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get()
  async find(@Query() query: FindReleasesDto): Promise<IReleasesResponse> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 48;

    let result;

    switch (query.type) {
      case 'new':
        result = await this.releasesService.findNewReleases(page, pageSize);
        break;
      case 'popular':
        result = await this.releasesService.findPopularReleases(page, pageSize);
        break;
      case 'upcoming':
        result = await this.releasesService.findUpcomingReleases(
          page,
          pageSize,
        );
        break;
      case 'recent':
        result = await this.releasesService.findRecentlyAddedReleases(
          page,
          pageSize,
        );
        break;
      case 'top':
        result = await this.releasesService.findTopReleases(page, pageSize);
        break;
      default:
        throw new BadRequestException('Invalid type');
    }

    return {
      releases: result.releases,
      totalItems: result.totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + result.releases.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(result.totalItems / pageSize),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IReleaseResponse> {
    const [release, contributors, tracks] = await Promise.all([
      this.releasesService.getReleaseFullInfo(id),
      this.releasesService.getContributors(id),
      this.releasesService.getReleaseTracks(id),
    ]);

    return {
      release,
      tracks,
      contributors,
    };
  }
}
