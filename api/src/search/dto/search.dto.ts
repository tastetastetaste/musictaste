import { SearchType } from 'shared';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class SearchDto {
  @IsString()
  q: string;
  @IsString({ each: true })
  type: SearchType[];
  @Type(() => Number)
  @IsInt()
  page: number;
  @Type(() => Number)
  @IsInt()
  pageSize: number;
}
