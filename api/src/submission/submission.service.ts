import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import {
  ContributorStatus,
  CreateArtistDto,
  CreateLabelDto,
  CreateReleaseDto,
  FindArtistSubmissionsDto,
  FindLabelSubmissionsDto,
  FindReleaseSubmissionsDto,
  IArtistSubmission,
  IArtistSubmissionsResponse,
  ILabelSubmissionsResponse,
  IReleaseSubmissionsResponse,
  ReleaseType,
  SubmissionStatus,
  SubmissionType,
  UpdateReleaseDto,
  VoteType,
} from 'shared';
import { In, Repository } from 'typeorm';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { LabelSubmission } from '../../db/entities/label-submission.entity';
import { Label } from '../../db/entities/label.entity';
import { Language } from '../../db/entities/language.entity';
import { ReleaseSubmissionVote } from '../../db/entities/release-submission-vote.entity';
import { ReleaseSubmission } from '../../db/entities/release-submission.entity';
import { Release } from '../../db/entities/release.entity';
import { CurrentUserPayload } from '../auth/session.serializer';
import { ImagesService } from '../images/images.service';
import { LabelsService } from '../labels/labels.service';
import { ReleasesService } from '../releases/releases.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Release) private releasesRepository: Repository<Release>,

    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,

    @InjectRepository(Label) private labelsRepository: Repository<Label>,

    @InjectRepository(Language)
    private languagesRepository: Repository<Language>,

    @InjectRepository(ReleaseSubmission)
    private releaseSubmissionRepository: Repository<ReleaseSubmission>,

    @InjectRepository(LabelSubmission)
    private labelSubmissionRepository: Repository<LabelSubmission>,
    @InjectRepository(ArtistSubmission)
    private artistSubmissionRepository: Repository<ArtistSubmission>,
    @InjectRepository(ReleaseSubmissionVote)
    private releaseSubmissionVoteRepository: Repository<ReleaseSubmissionVote>,
    private releasesService: ReleasesService,
    private imagesService: ImagesService,
    private usersService: UsersService,
    private labelsService: LabelsService,
  ) {}

  // --- ARTISTS

  async createArtistSubmission(
    { name }: CreateArtistDto,
    user: CurrentUserPayload,
  ) {
    const artistSubmission = new ArtistSubmission();
    artistSubmission.changes = { name };
    artistSubmission.submissionType = SubmissionType.CREATE;
    artistSubmission.submissionStatus =
      user.contributorStatus >= ContributorStatus.EDITOR
        ? SubmissionStatus.APPROVED
        : SubmissionStatus.AUTO_APPROVED;
    artistSubmission.userId = user.id;

    const artist = await this.applyArtistSubmission(artistSubmission);

    if (!artist) {
      throw new InternalServerErrorException('failed to create an artist');
    }

    artistSubmission.artistId = artist.id;

    await this.artistSubmissionRepository.save(artistSubmission);

    return {
      artist,
      message: `Artist "${name}" added successfully`,
    };
  }

  private async applyArtistSubmission(submission: ArtistSubmission) {
    if (submission.submissionType === SubmissionType.CREATE) {
      const artist = new Artist();

      artist.name = submission.changes.name;

      const newArtist = await this.artistsRepository.save(artist);

      return newArtist;
    } else {
      return false;
    }
  }

  // --- LABELS

  async createLabelSubmission(
    { name }: CreateLabelDto,
    user: CurrentUserPayload,
  ) {
    const labelSubmission = new LabelSubmission();
    labelSubmission.changes = { name };
    labelSubmission.submissionType = SubmissionType.CREATE;
    labelSubmission.submissionStatus =
      user.contributorStatus >= ContributorStatus.EDITOR
        ? SubmissionStatus.APPROVED
        : SubmissionStatus.AUTO_APPROVED;
    labelSubmission.userId = user.id;

    const label = await this.applyLabelSubmission(labelSubmission);

    if (!label) {
      throw new InternalServerErrorException('failed to create a label');
    }

    labelSubmission.labelId = label.id;

    await this.labelSubmissionRepository.save(labelSubmission);

    return {
      message: `Label "${name}" added successfully`,
      labelSubmission,
    };
  }

  private async applyLabelSubmission(submission: LabelSubmission) {
    if (submission.submissionType === SubmissionType.CREATE) {
      const label = await this.labelsService.createLabel(submission.changes);

      return label;
    } else {
      return false;
    }
  }

  // --- RELEASES

  async createReleaseSubmission(
    {
      title,
      artistsIds,
      date,
      labelsIds,
      languagesIds,
      tracks,
      type,
      note,
      ...rest
    }: CreateReleaseDto,
    user: CurrentUserPayload,
  ) {
    let imageUrl: string | null = null;

    try {
      if (rest.image) {
        imageUrl = (await this.imagesService.storeUpload(rest.image, 'release'))
          .path;
      } else if (rest.imageUrl) {
        imageUrl = (
          await this.imagesService.storeUploadFromUrl(rest.imageUrl, 'release')
        ).path;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw new BadRequestException('Image upload error');
    }

    const releaseSubmission = new ReleaseSubmission();
    releaseSubmission.userId = user.id;
    releaseSubmission.submissionType = SubmissionType.CREATE;

    releaseSubmission.submissionStatus =
      user.contributorStatus >= ContributorStatus.EDITOR
        ? SubmissionStatus.APPROVED
        : SubmissionStatus.AUTO_APPROVED;

    releaseSubmission.note = note;

    releaseSubmission.changes = {
      title: title,
      type: ReleaseType[type],
      date: dayjs(date).format('YYYY-MM-DD').toString(),
      artistsIds: artistsIds,
      labelsIds: labelsIds,
      languagesIds: languagesIds,
      imagePath: imageUrl,
      tracks: tracks,
    };

    const release = await this.applyReleaseSubmission(releaseSubmission);

    if (!release) {
      throw new InternalServerErrorException('failed to create a release');
    }

    releaseSubmission.releaseId = release.id;

    await this.releaseSubmissionRepository.save(releaseSubmission);

    return {
      message: `Release "${title}" added successfully`,
      release: release,
    };
  }

  async updateReleaseSubmission(
    releaseId: string,
    {
      title,
      artistsIds,
      date,
      labelsIds,
      languagesIds,
      tracks,
      type,
      note,
      ...rest
    }: UpdateReleaseDto,
    user: CurrentUserPayload,
  ) {
    const release = await this.releasesRepository.findOne({
      where: { id: releaseId },
    });

    const imageUrl: string = rest.image
      ? (await this.imagesService.storeUpload(rest.image, 'release')).path
      : rest.imageUrl &&
          rest.imageUrl !==
            this.imagesService.getReleaseCover(release.imagePath).original
        ? (
            await this.imagesService.storeUploadFromUrl(
              rest.imageUrl,
              'release',
            )
          ).path
        : release.imagePath;

    const rs = new ReleaseSubmission();
    rs.userId = user.id;
    rs.releaseId = releaseId;
    rs.submissionType = SubmissionType.UPDATE;
    rs.submissionStatus =
      user.contributorStatus >= ContributorStatus.EDITOR
        ? SubmissionStatus.APPROVED
        : SubmissionStatus.OPEN;

    rs.note = note;

    rs.changes = {
      title: title,
      type: ReleaseType[type],
      date: dayjs(date).format('YYYY-MM-DD').toString(),
      artistsIds: artistsIds,
      labelsIds: labelsIds,
      languagesIds: languagesIds,
      imagePath: imageUrl,
      tracks: tracks,
    };

    const newReleaseSubmission =
      await this.releaseSubmissionRepository.save(rs);

    if (newReleaseSubmission.submissionStatus === SubmissionStatus.APPROVED) {
      await this.applyReleaseSubmission(newReleaseSubmission);

      return { message: 'Edited successfully' };
    }

    return { message: 'Your edit request was submitted successfully' };
  }

  private async applyReleaseSubmission(submission: ReleaseSubmission) {
    if (submission.submissionType === SubmissionType.CREATE) {
      const release = await this.releasesService.createRelease(submission);

      return release;
    } else {
      const release = await this.releasesService.updateRelease(submission);

      return release;
    }
  }

  async releaseSubmissionVote(
    submissionId: string,
    vote: VoteType,
    user: CurrentUserPayload,
  ) {
    const releaseSubmission = await this.releaseSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });

    if (
      !releaseSubmission ||
      releaseSubmission.submissionStatus === SubmissionStatus.APPROVED ||
      releaseSubmission.submissionStatus === SubmissionStatus.DISAPPROVED
    )
      throw new BadRequestException();

    const newVote = new ReleaseSubmissionVote();
    newVote.type = vote;
    newVote.userId = user.id;
    newVote.releaseSubmissionId = releaseSubmission.id;

    await this.releaseSubmissionVoteRepository.save(newVote);

    let closeSubmission = false;
    let approveSubmission = false;

    if (user.contributorStatus >= ContributorStatus.EDITOR) {
      closeSubmission = true;
      approveSubmission = vote === VoteType.UP;
    } else if (
      user.contributorStatus >= ContributorStatus.TRUSTED_CONTRIBUTOR
    ) {
      const submissionVotes = await this.releaseSubmissionVoteRepository
        .createQueryBuilder('v')
        .addSelect('COUNT(v.id)', 'totalVotes')
        .addSelect('SUM(v.vote)', 'netVotes')
        .where('v.releaseSubmissionId = :id', { id: submissionId })
        .getRawOne();

      closeSubmission = Number(submissionVotes.totalVotes) >= 3;
      approveSubmission = Number(submissionVotes.netVotes) > 0;
    } else {
      throw new BadRequestException();
    }

    if (closeSubmission) {
      if (
        approveSubmission &&
        releaseSubmission.submissionStatus === SubmissionStatus.OPEN
      ) {
        await this.applyReleaseSubmission(releaseSubmission);
      } else if (
        !approveSubmission &&
        releaseSubmission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
        releaseSubmission.submissionType === SubmissionType.CREATE
      ) {
        // TODO: revert create release
      }

      releaseSubmission.submissionStatus = approveSubmission
        ? SubmissionStatus.APPROVED
        : SubmissionStatus.DISAPPROVED;

      await this.releaseSubmissionRepository.save(releaseSubmission);
    }

    return { message: 'Voted successfully' };
  }

  async getReleaseSubmissions({
    open,
    releaseId,
    userId,
    page,
  }: FindReleaseSubmissionsDto): Promise<IReleaseSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (open) where.submissionStatus = SubmissionStatus.OPEN;
    if (releaseId) where.releaseId = releaseId;
    if (userId) where.userId = userId;

    const [rss, totalItems] =
      await this.releaseSubmissionRepository.findAndCount({
        where,
        order: {
          createdAt: 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    const [artists, labels, languages, users] = await Promise.all([
      this.artistsRepository.find({
        where: { id: In(rss.flatMap((rs) => rs.changes.artistsIds)) },
      }),
      this.labelsRepository.find({
        where: { id: In(rss.flatMap((rs) => rs.changes.labelsIds)) },
      }),
      this.languagesRepository.find({
        where: { id: In(rss.flatMap((rs) => rs.changes.languagesIds)) },
      }),
      this.usersService.getUsersByIds(rss.map((rs) => rs.userId)),
    ]);

    return {
      releases: rss.map(
        ({
          changes: {
            artistsIds,
            labelsIds,
            languagesIds,
            imagePath,
            type,
            ...changes
          },
          ...rs
        }) => ({
          artists: artistsIds?.map((id) => artists.find((a) => a.id === id)),
          labels: labelsIds?.map((id) => labels.find((l) => l.id === id)),
          languages: languagesIds?.map((id) =>
            languages.find((l) => l.id === id),
          ),
          user: users.find((u) => u.id === rs.userId),
          imageUrl: this.imagesService.getImageUrl(imagePath),
          type: ReleaseType[type],
          ...changes,
          ...rs,
        }),
      ),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + rss.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async getArtistSubmissions({
    page,
    open,
    artistId,
    userId,
  }: FindArtistSubmissionsDto): Promise<IArtistSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (open) where.submissionStatus = SubmissionStatus.OPEN;
    if (artistId) where.artistId = artistId;
    if (userId) where.userId = userId;

    const [rss, totalItems] =
      await this.artistSubmissionRepository.findAndCount({
        where,
        order: {
          createdAt: 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    const users = await this.usersService.getUsersByIds(
      rss.map((rs) => rs.userId),
    );

    return {
      artists: rss.map(({ changes, ...rs }) => ({
        user: users.find((u) => u.id === rs.userId),
        ...changes,
        ...rs,
      })),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + rss.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async getLabelSubmissions({
    page,
    open,
    labelId,
    userId,
  }: FindLabelSubmissionsDto): Promise<ILabelSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (open) where.submissionStatus = SubmissionStatus.OPEN;
    if (labelId) where.labelId = labelId;
    if (userId) where.userId = userId;

    const [rss, totalItems] = await this.labelSubmissionRepository.findAndCount(
      {
        where,
        order: {
          createdAt: 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    );

    const users = await this.usersService.getUsersByIds(
      rss.map((rs) => rs.userId),
    );

    return {
      labels: rss.map(({ changes: { ...changes }, ...rs }) => ({
        user: users.find((u) => u.id === rs.userId),
        ...changes,
        ...rs,
      })),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + rss.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
}
