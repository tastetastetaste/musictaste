import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ContributorStatus, CreateGenreVoteDto, IGenreResponse } from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';
import { GenresService } from './genres.service';
import { CurrentUserPayload } from '../auth/session.serializer';

@Controller('genres')
@UseGuards(AuthenticatedGuard)
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IGenreResponse> {
    return this.genresService.findOne(id);
  }

  @Get('release/:id')
  find(@Param('id') id: string) {
    return this.genresService.releaseGenres(id);
  }

  @Post('rg')
  vote(@Body() body: CreateGenreVoteDto, @CurUser() user: CurrentUserPayload) {
    if (user.contributorStatus < ContributorStatus.CONTRIBUTOR)
      throw new UnauthorizedException();

    return this.genresService.genreVote(body, user.id);
  }

  @Delete('rg/:id')
  removeVote(@Param('id') id: string, @CurUser('id') userId) {
    return this.genresService.removeGenreVote({ releaseGenreId: id }, userId);
  }
}
