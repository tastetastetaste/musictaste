import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ILabelResponse, ILabelSummary } from 'shared';
import { LabelsService } from './labels.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 5) // 5 minutes
  findMany(@Query('ids') ids: string): Promise<ILabelSummary[]> {
    const idArray = ids ? ids.split(',') : [];
    return this.labelsService.findByIds(idArray);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 5) // 5 minutes
  findOne(@Param('id') id: string): Promise<ILabelResponse> {
    return this.labelsService.findOne(id);
  }
}
