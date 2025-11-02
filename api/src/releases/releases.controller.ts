import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  FindReleasesDto,
  FindReleasesType,
  IReleaseResponse,
  IReleasesResponse,
} from 'shared';
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
      case FindReleasesType.New:
        result = await this.releasesService.findNewReleases(
          page,
          pageSize,
          query.genreId,
          query.labelId,
        );
        break;
      case FindReleasesType.Popular:
        result = await this.releasesService.findPopularReleases(page, pageSize);
        break;
      case FindReleasesType.NewPopular:
        result = await this.releasesService.findNewPopularReleases(
          page,
          pageSize,
        );
        break;
      case FindReleasesType.Upcoming:
        result = await this.releasesService.findUpcomingReleases(
          page,
          pageSize,
        );
        break;
      case FindReleasesType.RecentlyAdded:
        result = await this.releasesService.findRecentlyAddedReleases(
          page,
          pageSize,
        );
        break;
      case FindReleasesType.Top:
        result = await this.releasesService.findTopReleasesOAT(page, pageSize);
        break;
      case FindReleasesType.TopOTY:
        result = await this.releasesService.findTopReleasesOTY(page, pageSize);
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
