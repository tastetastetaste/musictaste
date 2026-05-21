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
import { ReviewsService } from './reviews.service';
import { FindReviewsDto, ReviewVoteDto } from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get()
  find(@Query() query: FindReviewsDto) {
    return this.reviewsService.find(query);
  }

  @Get('votes/me')
  @UseGuards(AuthenticatedGuard)
  getUserReviewVotes(@Query('ids') ids: string, @CurUser('id') userId: string) {
    const idArray = ids ? ids.split(',') : [];
    return this.reviewsService.getUserReviewVotes(idArray, userId);
  }

  @Post('votes/:reviewId')
  @UseGuards(AuthenticatedGuard)
  reviewVote(
    @Param('reviewId') reviewId: string,
    @Body() body: ReviewVoteDto,
    @CurUser('id') userId: string,
  ) {
    return this.reviewsService.reviewVote(reviewId, userId, body.vote);
  }

  @Delete('votes/:reviewId')
  @UseGuards(AuthenticatedGuard)
  removeReviewVote(
    @Param('reviewId') reviewId: string,
    @CurUser('id') userId: string,
  ) {
    return this.reviewsService.removeReviewVote(reviewId, userId);
  }
}
