import { Controller, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { LabelsService } from './labels.service';

@Controller('labels')
@UseGuards(AuthenticatedGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}
}
