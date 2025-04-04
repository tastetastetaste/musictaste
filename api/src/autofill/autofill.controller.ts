import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { AutofillService } from './autofill.service';

@Controller('autofill')
@UseGuards(AuthenticatedGuard)
export class AutofillController {
  constructor(private readonly autofillService: AutofillService) {}

  @Get('musicbrainz/:id')
  musicbrainz(@Param('id') id: string) {
    return this.autofillService.musicbrainz(id);
  }
}
