import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { EntitiesService } from './entities.service';
import { EntitiesReferenceService } from './entitiesReference.service';

@Controller('entities')
export class EntitiesController {
  constructor(
    private readonly entitiesService: EntitiesService,
    private readonly entitiesReferenceService: EntitiesReferenceService,
  ) {}

  @Post('parse-links')
  @UseGuards(AuthenticatedGuard)
  async parseLinks(@Body() body: { text: string }) {
    return {
      text: await this.entitiesReferenceService.parseLinks(body.text),
    };
  }
}
