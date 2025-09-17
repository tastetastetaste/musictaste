import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ContributorStatus,
  CreateArtistDto,
  CreateGenreDto,
  CreateLabelDto,
  CreateReleaseDto,
  FindArtistSubmissionsDto,
  FindGenreSubmissionsDto,
  FindLabelSubmissionsDto,
  FindReleaseSubmissionsDto,
  ProcessPendingDeletionDto,
  SubmissionVoteDto,
  UpdateGenreDto,
  UpdateReleaseDto,
} from 'shared';
import { AuthenticatedGuard } from '../auth/Authenticated.guard';
import { CurrentUserPayload } from '../auth/session.serializer';
import { CurUser } from '../decorators/user.decorator';
import { SubmissionService } from './submission.service';
import { Throttle } from '@nestjs/throttler';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Throttle({ default: { limit: 60, ttl: 1000 * 60 * 60 } })
  @Post('artists')
  @UseGuards(AuthenticatedGuard)
  createArtist(
    @Body() createArtistDto: CreateArtistDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.createArtistSubmission(
      createArtistDto,
      user,
    );
  }

  @Throttle({ default: { limit: 60, ttl: 1000 * 60 * 60 } })
  @Post('labels')
  @UseGuards(AuthenticatedGuard)
  createLabel(
    @Body() createLabelDto: CreateLabelDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.createLabelSubmission(createLabelDto, user);
  }

  @Throttle({ default: { limit: 20, ttl: 1000 * 60 * 60 } })
  @Post('genres')
  @UseGuards(AuthenticatedGuard)
  createGenre(
    @Body() createGenreDto: CreateGenreDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.createGenreSubmission(createGenreDto, user);
  }

  @Throttle({ default: { limit: 20, ttl: 1000 * 60 * 60 } })
  @Post('genres/:genreId')
  @UseGuards(AuthenticatedGuard)
  updateGenre(
    @Param('genreId') genreId: string,
    @Body() updateGenreDto: UpdateGenreDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.updateGenreSubmission(
      genreId,
      updateGenreDto,
      user,
    );
  }

  @Throttle({ default: { limit: 60, ttl: 1000 * 60 * 60 } })
  @Post('releases')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthenticatedGuard)
  createRelease(
    @Body() createReleaseDto: CreateReleaseDto,
    @UploadedFile() image: Express.Multer.File,
    @CurUser() user: CurrentUserPayload,
  ) {
    createReleaseDto.image = image
      ? { buffer: image.buffer, mimetype: image.mimetype }
      : null;
    return this.submissionsService.createReleaseSubmission(
      createReleaseDto,
      user,
    );
  }

  @Post('releases/:releaseId')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthenticatedGuard)
  updateRelease(
    @Param('releaseId') releaseId: string,
    @Body() updateReleaseDto: UpdateReleaseDto,
    @UploadedFile() image: Express.Multer.File,
    @CurUser() user: CurrentUserPayload,
  ) {
    updateReleaseDto.image = image
      ? { buffer: image.buffer, mimetype: image.mimetype }
      : null;
    return this.submissionsService.updateReleaseSubmission(
      releaseId,
      updateReleaseDto,
      user,
    );
  }

  @Patch('releases/vote/:submissionId')
  @UseGuards(AuthenticatedGuard)
  releaseSubmissionVote(
    @Param('submissionId') submissionId: string,
    @Body() body: SubmissionVoteDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus < ContributorStatus.TRUSTED_CONTRIBUTOR)
      throw new UnauthorizedException();

    return this.submissionsService.releaseSubmissionVote(
      submissionId,
      body.vote,
      user,
    );
  }

  @Patch('labels/vote/:submissionId')
  @UseGuards(AuthenticatedGuard)
  labelSubmissionVote(
    @Param('submissionId') submissionId: string,
    @Body() body: SubmissionVoteDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus < ContributorStatus.TRUSTED_CONTRIBUTOR)
      throw new UnauthorizedException();

    return this.submissionsService.labelSubmissionVote(
      submissionId,
      body.vote,
      user,
    );
  }

  @Patch('artists/vote/:submissionId')
  @UseGuards(AuthenticatedGuard)
  artistSubmissionVote(
    @Param('submissionId') submissionId: string,
    @Body() body: SubmissionVoteDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus < ContributorStatus.TRUSTED_CONTRIBUTOR)
      throw new UnauthorizedException();

    return this.submissionsService.artistSubmissionVote(
      submissionId,
      body.vote,
      user,
    );
  }

  @Patch('genres/vote/:submissionId')
  @UseGuards(AuthenticatedGuard)
  genreSubmissionVote(
    @Param('submissionId') submissionId: string,
    @Body() body: SubmissionVoteDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus < ContributorStatus.TRUSTED_CONTRIBUTOR)
      throw new UnauthorizedException();

    return this.submissionsService.genreSubmissionVote(
      submissionId,
      body.vote,
      user,
    );
  }

  @Delete('releases/:submissionId')
  @UseGuards(AuthenticatedGuard)
  discardMyReleaseSubmission(
    @Param('submissionId') submissionId: string,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.discardMyReleaseSubmission(
      submissionId,
      user.id,
    );
  }

  @Delete('labels/:submissionId')
  @UseGuards(AuthenticatedGuard)
  discardMyLabelSubmission(
    @Param('submissionId') submissionId: string,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.discardMyLabelSubmission(
      submissionId,
      user.id,
    );
  }

  @Delete('artists/:submissionId')
  @UseGuards(AuthenticatedGuard)
  discardMyArtistSubmission(
    @Param('submissionId') submissionId: string,
    @CurUser() user: CurrentUserPayload,
  ) {
    return this.submissionsService.discardMyArtistSubmission(
      submissionId,
      user.id,
    );
  }

  @Post('process-pending-deletion')
  @UseGuards(AuthenticatedGuard)
  processPendingDeletion(
    @Body() body: ProcessPendingDeletionDto,
    @CurUser() user: CurrentUserPayload,
  ) {
    if (user.contributorStatus !== ContributorStatus.ADMIN)
      throw new UnauthorizedException();

    return this.submissionsService.processPendingDeletion(body);
  }

  @Get('releases')
  @UseGuards(AuthenticatedGuard)
  getReleaseSubmissions(@Query() query: FindReleaseSubmissionsDto) {
    return this.submissionsService.getReleaseSubmissions(query);
  }

  @Get('artists')
  @UseGuards(AuthenticatedGuard)
  getArtistSubmissions(@Query() query: FindArtistSubmissionsDto) {
    return this.submissionsService.getArtistSubmissions(query);
  }

  @Get('labels')
  @UseGuards(AuthenticatedGuard)
  getLabelSubmissions(@Query() query: FindLabelSubmissionsDto) {
    return this.submissionsService.getLabelSubmissions(query);
  }

  @Get('genres')
  @UseGuards(AuthenticatedGuard)
  getGenreSubmissions(@Query() query: FindGenreSubmissionsDto) {
    return this.submissionsService.getGenreSubmissions(query);
  }

  @Get('user-contributions/:userId')
  @UseGuards(AuthenticatedGuard)
  getUserContributions(@Param('userId') userId: string) {
    return this.submissionsService.getUserContributionsStats(userId);
  }
}
