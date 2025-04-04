import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateEntryDto,
  FindEntriesDto,
  ReviewVoteDto,
  TrackVoteDto,
  UpdateEntryDto,
} from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurUser } from '../decorators/user.decorator';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() body: CreateEntryDto, @CurUser('id') userId: string) {
    return this.entriesService.create(body, userId);
  }

  @Get()
  find(@Query() query: FindEntriesDto, @CurUser('id') userId: string) {
    return this.entriesService.find(query, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.entriesService.findOne({ id }, userId);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  update(
    @Param('id') id: string,
    @Body() body: UpdateEntryDto,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.update(id, body, userId);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  remove(@Param('id') id: string, @CurUser('id') userId: string) {
    return this.entriesService.remove(id, userId);
  }

  @Get('release/:releaseId/me')
  @UseGuards(AuthenticatedGuard)
  findMyEntry(
    @Param('releaseId') releaseId: string,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.findOne({ releaseId, userId }, userId);
  }

  @Get('release/:releaseId/following')
  @UseGuards(AuthenticatedGuard)
  fromFollowing(
    @Param('releaseId') releaseId: string,
    @CurUser('id') userId: string,
  ) {
    return userId
      ? this.entriesService.findReleaseFollowingEntries(releaseId, userId)
      : null;
  }

  @Post('track/:releaseId/:trackId')
  @UseGuards(AuthenticatedGuard)
  trackVote(
    @Param('releaseId') releaseId: string,
    @Param('trackId') trackId: string,
    @Body() body: TrackVoteDto,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.trackVote(
      {
        trackId,
        releaseId,
        vote: body.vote,
      },
      userId,
    );
  }
  @Delete('track/:releaseId/:trackId')
  @UseGuards(AuthenticatedGuard)
  removeTrackVote(
    @Param('releaseId') releaseId: string,
    @Param('trackId') trackId: string,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.removeTrackVote(
      {
        releaseId,
        trackId,
      },
      userId,
    );
  }
  @Post('review/:reviewId/votes')
  @UseGuards(AuthenticatedGuard)
  reviewVote(
    @Param('reviewId') reviewId: string,
    @Body() body: ReviewVoteDto,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.reviewVote(reviewId, userId, body.vote);
  }

  @Delete('review/:reviewId/votes')
  @UseGuards(AuthenticatedGuard)
  removeReviewVote(
    @Param('reviewId') reviewId: string,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.removeReviewVote(reviewId, userId);
  }

  @Post('review/:reviewId/comments')
  @UseGuards(AuthenticatedGuard)
  reviewComment(
    @Param('reviewId') reviewId: string,
    @Body('body') body: string,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.createReviewComment({ reviewId, body }, userId);
  }

  @Get('review/:reviewId/comments')
  findComments(
    @Param('reviewId') reviewId: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.entriesService.findReviewComments({ page, reviewId }, 24);
  }

  @Delete('review/:reviewId/comments')
  @UseGuards(AuthenticatedGuard)
  removeReviewComment(
    @Param('reviewId') reviewId: string,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.removeReviewComment(reviewId, userId);
  }

  @Get('/user/:userId/artists')
  getUserArtists(@Param('userId') userId: string) {
    return this.entriesService.userEntriesArtists(userId);
  }

  @Get('/user/:userId/ratings')
  getUserRatings(@Param('userId') userId: string) {
    return this.entriesService.userEntriesRatings(userId);
  }

  @Get('/user/:userId/genres')
  getUserGenres(@Param('userId') userId: string) {
    return this.entriesService.userEntriesGenres(userId);
  }

  @Get('/user/:userId/labels')
  getUserLabels(@Param('userId') userId: string) {
    return this.entriesService.userEntriesLabels(userId);
  }

  @Get('/user/:userId/release-date')
  getUserDates(@Param('userId') userId: string) {
    return this.entriesService.userEntriesReleaseDate(userId);
  }

  @Get('/user/:userId/tags')
  getUserTags(@Param('userId') userId: string) {
    return this.entriesService.userEntriesTags(userId);
  }

  @Post('/user/tags')
  @UseGuards(AuthenticatedGuard)
  createUserTag(@Body('tag') tag: string, @CurUser('id') userId: string) {
    return this.entriesService.createTag(tag, userId);
  }

  @Patch('/user/tags/:id')
  @UseGuards(AuthenticatedGuard)
  updateUserTag(
    @Body('tag') tag: string,
    @Param('id') id: string,
    @CurUser('id') userId: string,
  ) {
    return this.entriesService.updateTag(id, tag, userId);
  }

  @Delete('/user/tags/:id')
  @UseGuards(AuthenticatedGuard)
  deleteUserTag(
    @Param('id') id: string,

    @CurUser('id') userId: string,
  ) {
    return this.entriesService.deleteTag(id, userId);
  }
}
