import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, FindCommentsDto } from 'shared';
import { CurUser } from '../decorators/user.decorator';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Throttle({ default: { limit: 10, ttl: 1000 * 60 } })
  @Post()
  @UseGuards(AuthenticatedGuard)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurUser('id') userId: string,
  ) {
    return this.commentsService.create(createCommentDto, userId);
  }

  @Get()
  find(@Query() findCommentsDto: FindCommentsDto) {
    return this.commentsService.find(findCommentsDto);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  remove(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.commentsService.remove(id, userId);
  }
}
