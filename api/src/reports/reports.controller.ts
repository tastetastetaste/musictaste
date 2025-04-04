import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateReportDto } from 'shared';
import { ReportsService } from './reports.service';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  create(
    @Body() createReportDto: CreateReportDto,
    @CurUser('id') userId: string,
  ) {
    return this.reportsService.create(createReportDto, userId);
  }
}
