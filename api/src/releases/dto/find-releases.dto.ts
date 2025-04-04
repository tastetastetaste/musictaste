import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class FindNewReleasesDto {
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class FindRecentlyAddedDto {
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class FindPopularDto {
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class FindChartDto {
  @Type(() => Number)
  @IsInt()
  page: number;
}
