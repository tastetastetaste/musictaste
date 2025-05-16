import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { LabelsService } from './labels.service';
import { ILabelResponse } from 'shared';

@Controller('labels')
@UseGuards(AuthenticatedGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ILabelResponse> {
    return this.labelsService.findOneWithReleases(id);
  }
}
