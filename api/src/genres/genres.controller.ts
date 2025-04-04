import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateGenreVoteDto } from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';
import { GenresService } from './genres.service';

@Controller('genres')
@UseGuards(AuthenticatedGuard)
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get('release/:id')
  find(@Param('id') id: string) {
    return this.genresService.releaseGenres(id);
  }

  @Post('rg')
  vote(@Body() body: CreateGenreVoteDto, @CurUser('id') userId) {
    return this.genresService.genreVote(body, userId);
  }

  @Delete('rg/:id')
  removeVote(@Param('id') id: string, @CurUser('id') userId) {
    return this.genresService.removeGenreVote({ releaseGenreId: id }, userId);
  }
}
