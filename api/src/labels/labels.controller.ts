import { Controller, Get, Param } from '@nestjs/common';
import { ILabelResponse } from 'shared';
import { LabelsService } from './labels.service';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ILabelResponse> {
    return this.labelsService.findOne(id);
  }
}
