import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
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
  IArtistSubmissionsResponse,
  IGenreSubmissionsResponse,
  ILabelSubmissionsResponse,
  IReleaseSubmissionsResponse,
  ProcessPendingDeletionDto,
  ReleaseType,
  SubmissionStatus,
  SubmissionType,
  UpdateArtistDto,
  UpdateGenreDto,
  UpdateReleaseDto,
  VoteType,
} from 'shared';
import { In, Repository } from 'typeorm';
import { ArtistSubmissionVote } from '../../db/entities/artist-submission-vote.entity';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { LabelSubmissionVote } from '../../db/entities/label-submission-vote.entity';
import { LabelSubmission } from '../../db/entities/label-submission.entity';
import { Label } from '../../db/entities/label.entity';
import { Language } from '../../db/entities/language.entity';
import { ReleaseSubmissionVote } from '../../db/entities/release-submission-vote.entity';
import { ReleaseSubmission } from '../../db/entities/release-submission.entity';
import { Release } from '../../db/entities/release.entity';
import { ArtistsService } from '../artists/artists.service';
import { CurrentUserPayload } from '../auth/session.serializer';
import { ImagesService } from '../images/images.service';
import { LabelsService } from '../labels/labels.service';
import { ReleasesService } from '../releases/releases.service';
import { UsersService } from '../users/users.service';
import { GenreSubmission } from '../../db/entities/genre-submission.entity';
import { GenreSubmissionVote } from '../../db/entities/genre-submission-vote.entity';
import { GenresService } from '../genres/genres.service';
import { SubmissionSortByEnum } from 'shared';
import { Genre } from '../../db/entities/genre.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Release) private releasesRepository: Repository<Release>,

    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,

    @InjectRepository(Label) private labelsRepository: Repository<Label>,

    @InjectRepository(Genre) private genresRepository: Repository<Genre>,

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
    @InjectRepository(LabelSubmissionVote)
    private labelSubmissionVoteRepository: Repository<LabelSubmissionVote>,
    @InjectRepository(ArtistSubmissionVote)
    private artistSubmissionVoteRepository: Repository<ArtistSubmissionVote>,
    @InjectRepository(GenreSubmission)
    private genreSubmissionRepository: Repository<GenreSubmission>,
    @InjectRepository(GenreSubmissionVote)
    private genreSubmissionVoteRepository: Repository<GenreSubmissionVote>,
    private releasesService: ReleasesService,
    private imagesService: ImagesService,
    private usersService: UsersService,
    private labelsService: LabelsService,
    private artistsService: ArtistsService,
    private genresService: GenresService,
  ) {}

  // --- ARTISTS

  async createArtistSubmission(
    { name, nameLatin }: CreateArtistDto,
    user: CurrentUserPayload,
  ) {
    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );
    const artistSubmission = new ArtistSubmission();
    artistSubmission.changes = { name, nameLatin };
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

  async updateArtistSubmission(
    artistId: string,
    { name, nameLatin, note }: UpdateArtistDto,
    user: CurrentUserPayload,
  ) {
    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );

    const artist = await this.artistsRepository.findOne({
      where: { id: artistId },
    });

    if (!artist) throw new NotFoundException();

    const exist = await this.artistSubmissionRepository.findOne({
      where: {
        artistId,
        submissionStatus: SubmissionStatus.OPEN,
      },
    });

    if (exist) {
      throw new BadRequestException(
        'There is already an open edit submission for this artist',
      );
    }

    const as = new ArtistSubmission();
    as.artistId = artistId;
    as.changes = { name, nameLatin };
    as.original = { name: artist.name, nameLatin: artist.nameLatin };
    as.submissionType = SubmissionType.UPDATE;
    as.submissionStatus = SubmissionStatus.OPEN;
    as.userId = user.id;
    as.note = note;

    await this.artistSubmissionRepository.save(as);

    return {
      message: `Artist "${name}" is awaiting approval`,
      artistSubmission: as,
    };
  }

  private async applyArtistSubmission(submission: ArtistSubmission) {
    if (submission.submissionType === SubmissionType.CREATE) {
      const artist = this.artistsService.create(submission.changes);

      return artist;
    } else if (submission.submissionType === SubmissionType.UPDATE) {
      const artist = await this.artistsService.updateArtist({
        artistId: submission.artistId,
        changes: submission.changes,
      });

      return artist;
    } else {
      return false;
    }
  }

  // --- LABELS

  async createLabelSubmission(
    { name }: CreateLabelDto,
    user: CurrentUserPayload,
  ) {
    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );
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
      titleLatin,
      artistsIds,
      date,
      labelsIds,
      languagesIds,
      tracks,
      type,
      note,
      explicitCoverArt,
      ...rest
    }: CreateReleaseDto,
    user: CurrentUserPayload,
  ) {
    let imageUrl: string | null = null;

    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );

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
      titleLatin: titleLatin,
      type: ReleaseType[type],
      date: dayjs(date).format('YYYY-MM-DD').toString(),
      artistsIds: artistsIds,
      labelsIds: labelsIds,
      languagesIds: languagesIds,
      imagePath: imageUrl,
      tracks: tracks,
      explicitCoverArt: explicitCoverArt,
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
      titleLatin,
      artistsIds,
      date,
      labelsIds,
      languagesIds,
      tracks,
      type,
      note,
      explicitCoverArt,
      ...rest
    }: UpdateReleaseDto,
    user: CurrentUserPayload,
  ) {
    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );
    const release = await this.releasesRepository.findOne({
      where: { id: releaseId },
      relations: {
        artistConnection: true,
        labelConnection: true,
        languageConnection: true,
        tracks: true,
      },
    });

    if (!release) throw new NotFoundException();

    const exist = await this.releaseSubmissionRepository.findOne({
      where: {
        releaseId,
        submissionStatus: SubmissionStatus.OPEN,
      },
    });

    if (exist) {
      throw new BadRequestException(
        'There is already an open edit submission for this release',
      );
    }

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
      titleLatin: titleLatin,
      type: ReleaseType[type],
      date: dayjs(date).format('YYYY-MM-DD').toString(),
      artistsIds: artistsIds,
      labelsIds: labelsIds,
      languagesIds: languagesIds,
      imagePath: imageUrl,
      tracks: tracks,
      explicitCoverArt: explicitCoverArt,
    };

    rs.original = {
      title: release.title,
      titleLatin: release.titleLatin,
      type: release.type,
      date: release.date,
      artistsIds: release.artistConnection.map((a) => a.artistId),
      labelsIds: release.labelConnection.map((l) => l.labelId),
      languagesIds: release.languageConnection.map((l) => l.languageId),
      imagePath: release.imagePath,
      explicitCoverArt: release.explicitCoverArt,
      tracks: release.tracks
        .sort((a, b) => a.order - b.order)
        .map((t) => ({
          id: t.id,
          track: t.track,
          title: t.title,
          durationMs: t.durationMs,
        })),
    };

    const newReleaseSubmission =
      await this.releaseSubmissionRepository.save(rs);

    if (newReleaseSubmission.submissionStatus === SubmissionStatus.APPROVED) {
      await this.applyReleaseSubmission(newReleaseSubmission);

      return { message: 'Your changes are live!' };
    }

    return { message: 'Submitted for review - thank you!' };
  }

  // --- GENRES

  // genreSubmission.genreId = genre.id;
  private async applyGenreSubmission(submission: GenreSubmission) {
    if (submission.submissionType === SubmissionType.CREATE) {
      const genre = await this.genresService.createGenre(submission);

      return genre;
    } else {
      const genre = await this.genresService.updateGenre(submission);

      return genre;
    }
  }

  async createGenreSubmission(
    { name, bio, note }: CreateGenreDto,
    user: CurrentUserPayload,
  ) {
    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );
    const genreSubmission = new GenreSubmission();
    genreSubmission.changes = { name, bio };
    genreSubmission.submissionType = SubmissionType.CREATE;
    genreSubmission.submissionStatus = SubmissionStatus.OPEN;
    genreSubmission.userId = user.id;
    genreSubmission.note = note;

    await this.genreSubmissionRepository.save(genreSubmission);

    return {
      message: `Genre "${name}" is awaiting approval`,
      genreSubmission: genreSubmission,
    };
  }

  async updateGenreSubmission(
    genreId: string,
    { name, bio, note }: UpdateGenreDto,
    user: CurrentUserPayload,
  ) {
    if (user.contributorStatus === ContributorStatus.NOT_A_CONTRIBUTOR)
      throw new BadRequestException(
        "You can't submit contributions at this time",
      );

    const genre = await this.genresRepository.findOne({
      where: { id: genreId },
    });

    if (!genre) throw new NotFoundException();

    const exist = await this.genreSubmissionRepository.findOne({
      where: {
        genreId,
        submissionStatus: SubmissionStatus.OPEN,
      },
    });

    if (exist) {
      throw new BadRequestException(
        'There is already an open edit submission for this genre',
      );
    }

    const gs = new GenreSubmission();
    gs.genreId = genreId;
    gs.changes = { name, bio };
    gs.original = { name: genre.name, bio: genre.bio };
    gs.submissionType = SubmissionType.UPDATE;
    gs.submissionStatus = SubmissionStatus.OPEN;
    gs.userId = user.id;
    gs.note = note;

    await this.genreSubmissionRepository.save(gs);

    return {
      message: `Genre "${name}" is awaiting approval`,
      genreSubmission: gs,
    };
  }

  // --- approving/disapproving submissions

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
        .select('COUNT(v.id)', 'totalVotes')
        .addSelect('SUM(v.type)', 'netVotes')
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
      }

      // if (
      //   !approveSubmission &&
      //   releaseSubmission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
      //   releaseSubmission.submissionType === SubmissionType.CREATE
      // ) {
      //   await this.releasesService.deleteRelease(releaseSubmission.releaseId);
      //   releaseSubmission.releaseId = null;
      // }

      // releaseSubmission.submissionStatus = approveSubmission
      //   ? SubmissionStatus.APPROVED
      //   : SubmissionStatus.DISAPPROVED;

      releaseSubmission.submissionStatus = approveSubmission
        ? SubmissionStatus.APPROVED
        : releaseSubmission.submissionStatus ===
              SubmissionStatus.AUTO_APPROVED &&
            releaseSubmission.submissionType === SubmissionType.CREATE
          ? SubmissionStatus.PENDING_ENTITY_DELETION
          : SubmissionStatus.DISAPPROVED;

      await this.releaseSubmissionRepository.save(releaseSubmission);
    }

    return { message: 'Voted successfully' };
  }

  async processPendingDeletion({
    releaseSubmissionIds,
    artistSubmissionIds,
    labelSubmissionIds,
  }: ProcessPendingDeletionDto) {
    const results = [];

    if (releaseSubmissionIds && releaseSubmissionIds.length > 0) {
      const rSubmissions = await this.releaseSubmissionRepository.find({
        where: { id: In(releaseSubmissionIds) },
      });

      for (let i = 0; i < rSubmissions.length; i++) {
        const rs = rSubmissions[i];

        try {
          await this.releasesService.deleteRelease(rs.releaseId);
          await this.releaseSubmissionRepository.update(
            { id: rs.id },
            { submissionStatus: SubmissionStatus.DISAPPROVED },
          );
          results.push({ id: rs.id, status: 'deleted' });
        } catch (err) {
          results.push({ id: rs.id, status: 'error', error: err.message });
        }
      }
    }

    if (artistSubmissionIds && artistSubmissionIds.length > 0) {
      const aSubmission = await this.artistSubmissionRepository.find({
        where: {
          id: In(artistSubmissionIds),
        },
      });

      for (let i = 0; i < aSubmission.length; i++) {
        const as = aSubmission[i];

        try {
          await this.artistsService.deleteArtist(as.artistId);
          await this.artistSubmissionRepository.update(
            { id: as.id },
            { submissionStatus: SubmissionStatus.DISAPPROVED },
          );
          results.push({ id: as.id, status: 'deleted' });
        } catch (err) {
          results.push({ id: as.id, status: 'error', error: err.message });
        }
      }
    }

    if (labelSubmissionIds && labelSubmissionIds.length > 0) {
      const aSubmission = await this.labelSubmissionRepository.find({
        where: {
          id: In(labelSubmissionIds),
        },
      });

      for (let i = 0; i < aSubmission.length; i++) {
        const as = aSubmission[i];

        try {
          await this.labelsService.deleteLabel(as.labelId);
          await this.labelSubmissionRepository.update(
            { id: as.id },
            { submissionStatus: SubmissionStatus.DISAPPROVED },
          );
          results.push({ id: as.id, status: 'deleted' });
        } catch (err) {
          results.push({ id: as.id, status: 'error', error: err.message });
        }
      }
    }

    return {
      message: 'Process completed',
      results,
    };
  }

  async labelSubmissionVote(
    submissionId: string,
    vote: VoteType,
    user: CurrentUserPayload,
  ) {
    const labelSubmission = await this.labelSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });

    if (
      !labelSubmission ||
      labelSubmission.submissionStatus === SubmissionStatus.APPROVED ||
      labelSubmission.submissionStatus === SubmissionStatus.DISAPPROVED
    )
      throw new BadRequestException();

    const newVote = new LabelSubmissionVote();
    newVote.type = vote;
    newVote.userId = user.id;
    newVote.labelSubmissionId = labelSubmission.id;

    await this.labelSubmissionVoteRepository.save(newVote);

    let closeSubmission = false;
    let approveSubmission = false;

    if (user.contributorStatus >= ContributorStatus.EDITOR) {
      closeSubmission = true;
      approveSubmission = vote === VoteType.UP;
    } else if (
      user.contributorStatus >= ContributorStatus.TRUSTED_CONTRIBUTOR
    ) {
      const submissionVotes = await this.labelSubmissionVoteRepository
        .createQueryBuilder('v')
        .select('COUNT(v.id)', 'totalVotes')
        .addSelect('SUM(v.type)', 'netVotes')
        .where('v.labelSubmissionId = :id', { id: submissionId })
        .getRawOne();

      closeSubmission = Number(submissionVotes.totalVotes) >= 3;
      approveSubmission = Number(submissionVotes.netVotes) > 0;
    } else {
      throw new BadRequestException();
    }

    if (closeSubmission) {
      if (
        approveSubmission &&
        labelSubmission.submissionStatus === SubmissionStatus.OPEN
      ) {
        await this.applyLabelSubmission(labelSubmission);
      }

      // if (
      //   !approveSubmission &&
      //   labelSubmission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
      //   labelSubmission.submissionType === SubmissionType.CREATE
      // ) {
      //   await this.labelsService.deleteLabel(labelSubmission.labelId);
      //   labelSubmission.labelId = null;
      // }

      // labelSubmission.submissionStatus = approveSubmission
      //   ? SubmissionStatus.APPROVED
      //   : SubmissionStatus.DISAPPROVED;

      labelSubmission.submissionStatus = approveSubmission
        ? SubmissionStatus.APPROVED
        : labelSubmission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
            labelSubmission.submissionType === SubmissionType.CREATE
          ? SubmissionStatus.PENDING_ENTITY_DELETION
          : SubmissionStatus.DISAPPROVED;

      await this.labelSubmissionRepository.save(labelSubmission);
    }

    return { message: 'Voted successfully' };
  }

  async artistSubmissionVote(
    submissionId: string,
    vote: VoteType,
    user: CurrentUserPayload,
  ) {
    const artistSubmission = await this.artistSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });

    if (
      !artistSubmission ||
      artistSubmission.submissionStatus === SubmissionStatus.APPROVED ||
      artistSubmission.submissionStatus === SubmissionStatus.DISAPPROVED
    )
      throw new BadRequestException();

    const newVote = new ArtistSubmissionVote();
    newVote.type = vote;
    newVote.userId = user.id;
    newVote.artistSubmissionId = artistSubmission.id;

    await this.artistSubmissionVoteRepository.save(newVote);

    let closeSubmission = false;
    let approveSubmission = false;

    if (user.contributorStatus >= ContributorStatus.EDITOR) {
      closeSubmission = true;
      approveSubmission = vote === VoteType.UP;
    } else if (
      user.contributorStatus >= ContributorStatus.TRUSTED_CONTRIBUTOR
    ) {
      const submissionVotes = await this.artistSubmissionVoteRepository
        .createQueryBuilder('v')
        .select('COUNT(v.id)', 'totalVotes')
        .addSelect('SUM(v.type)', 'netVotes')
        .where('v.artistSubmissionId = :id', { id: submissionId })
        .getRawOne();

      closeSubmission = Number(submissionVotes.totalVotes) >= 3;
      approveSubmission = Number(submissionVotes.netVotes) > 0;
    } else {
      throw new BadRequestException();
    }

    if (closeSubmission) {
      if (
        approveSubmission &&
        artistSubmission.submissionStatus === SubmissionStatus.OPEN
      ) {
        await this.applyArtistSubmission(artistSubmission);
      }

      // if (
      //   !approveSubmission &&
      //   artistSubmission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
      //   artistSubmission.submissionType === SubmissionType.CREATE
      // ) {
      //   await this.artistsService.deleteArtist(artistSubmission.artistId);
      //   artistSubmission.artistId = null;
      // }

      // artistSubmission.submissionStatus = approveSubmission
      //   ? SubmissionStatus.APPROVED
      //   : SubmissionStatus.DISAPPROVED;

      artistSubmission.submissionStatus = approveSubmission
        ? SubmissionStatus.APPROVED
        : artistSubmission.submissionStatus ===
              SubmissionStatus.AUTO_APPROVED &&
            artistSubmission.submissionType === SubmissionType.CREATE
          ? SubmissionStatus.PENDING_ENTITY_DELETION
          : SubmissionStatus.DISAPPROVED;

      await this.artistSubmissionRepository.save(artistSubmission);
    }

    return { message: 'Voted successfully' };
  }

  async genreSubmissionVote(
    submissionId: string,
    vote: VoteType,
    user: CurrentUserPayload,
  ) {
    const genreSubmission = await this.genreSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });

    if (
      !genreSubmission ||
      genreSubmission.submissionStatus === SubmissionStatus.APPROVED ||
      genreSubmission.submissionStatus === SubmissionStatus.DISAPPROVED
    )
      throw new BadRequestException();

    const newVote = new GenreSubmissionVote();
    newVote.type = vote;
    newVote.userId = user.id;
    newVote.genreSubmissionId = genreSubmission.id;

    await this.genreSubmissionVoteRepository.save(newVote);

    let closeSubmission = false;
    let approveSubmission = false;

    if (user.contributorStatus >= ContributorStatus.EDITOR) {
      closeSubmission = true;
      approveSubmission = vote === VoteType.UP;
    } else if (
      user.contributorStatus >= ContributorStatus.TRUSTED_CONTRIBUTOR
    ) {
      const submissionVotes = await this.genreSubmissionVoteRepository
        .createQueryBuilder('v')
        .select('COUNT(v.id)', 'totalVotes')
        .addSelect('SUM(v.type)', 'netVotes')
        .where('v.genreSubmissionId = :id', { id: submissionId })
        .getRawOne();

      closeSubmission = Number(submissionVotes.totalVotes) >= 5;
      approveSubmission = Number(submissionVotes.netVotes) >= 3;
    } else {
      throw new BadRequestException();
    }

    if (closeSubmission) {
      if (
        approveSubmission &&
        genreSubmission.submissionStatus === SubmissionStatus.OPEN
      ) {
        const genre = await this.applyGenreSubmission(genreSubmission);
        if (genre) {
          genreSubmission.submissionStatus = SubmissionStatus.APPROVED;
          if (genreSubmission.submissionType === SubmissionType.CREATE)
            genreSubmission.genreId = genre.id;
        } else {
          genreSubmission.submissionStatus = SubmissionStatus.DISAPPROVED;
        }
      } else {
        genreSubmission.submissionStatus = SubmissionStatus.DISAPPROVED;
      }

      await this.genreSubmissionRepository.save(genreSubmission);
    }

    return { message: 'Voted successfully' };
  }

  // --- Query submissions

  async getReleaseSubmissions({
    status,
    releaseId,
    userId,
    page,
    sortBy,
  }: FindReleaseSubmissionsDto): Promise<IReleaseSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (status) where.submissionStatus = status;
    if (releaseId) where.releaseId = releaseId;
    if (userId) where.userId = userId;

    const [rss, totalItems] =
      await this.releaseSubmissionRepository.findAndCount({
        where,
        relations: ['votes'],
        order: {
          createdAt: sortBy === SubmissionSortByEnum.Oldest ? 'ASC' : 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    const allArtistIds = [
      ...new Set(
        rss.flatMap((rs) => [
          ...(rs.changes.artistsIds || []),
          ...(rs.original?.artistsIds || []),
        ]),
      ),
    ];

    const allLabelIds = [
      ...new Set(
        rss.flatMap((rs) => [
          ...(rs.changes.labelsIds || []),
          ...(rs.original?.labelsIds || []),
        ]),
      ),
    ];

    const allLanguageIds = [
      ...new Set(
        rss.flatMap((rs) => [
          ...(rs.changes.languagesIds || []),
          ...(rs.original?.languagesIds || []),
        ]),
      ),
    ];

    const uniqueUserIds = [
      ...new Set([
        ...rss.map((rs) => rs.userId),
        ...rss.flatMap((rs) => rs.votes?.map((vote) => vote.userId) || []),
      ]),
    ];

    const [artists, labels, languages, users] = await Promise.all([
      this.artistsRepository.find({ where: { id: In(allArtistIds) } }),
      this.labelsRepository.find({ where: { id: In(allLabelIds) } }),
      this.languagesRepository.find({ where: { id: In(allLanguageIds) } }),
      this.usersService.getUsersByIds(uniqueUserIds),
    ]);

    const resolveEntities = (ids: string[], source: any[]) =>
      ids?.map((id) => source.find((e) => e.id === id)).filter(Boolean) || [];

    return {
      releases: rss.map((rs) => {
        const changes = {
          ...rs.changes,
          type: ReleaseType[rs.changes.type],
          imageUrl: this.imagesService.getImageUrl(rs.changes.imagePath),
          artists: resolveEntities(rs.changes.artistsIds, artists),
          labels: resolveEntities(rs.changes.labelsIds, labels),
          languages: resolveEntities(rs.changes.languagesIds, languages),
          artistsIds: undefined,
          labelsIds: undefined,
          languagesIds: undefined,
          imagePath: undefined,
        };
        const original = rs.original
          ? {
              ...rs.original,
              type: ReleaseType[rs.original.type],
              imageUrl: this.imagesService.getImageUrl(rs.original.imagePath),
              artists: resolveEntities(rs.original.artistsIds, artists),
              labels: resolveEntities(rs.original.labelsIds, labels),
              languages: resolveEntities(rs.original.languagesIds, languages),
              artistsIds: undefined,
              labelsIds: undefined,
              languagesIds: undefined,
              imagePath: undefined,
            }
          : null;

        return {
          ...rs,
          user: users.find((u) => u.id === rs.userId),
          changes,
          original: original ? original : null,
          votes:
            rs.votes?.map((vote) => ({
              id: vote.id,
              type: vote.type,
              userId: vote.userId,
              user: users.find((u) => u.id === vote.userId),
              createdAt: vote.createdAt,
            })) || [],
        };
      }),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + rss.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async getArtistSubmissions({
    page,
    status,
    artistId,
    userId,
    sortBy,
  }: FindArtistSubmissionsDto): Promise<IArtistSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (status) where.submissionStatus = status;
    if (artistId) where.artistId = artistId;
    if (userId) where.userId = userId;

    const [rss, totalItems] =
      await this.artistSubmissionRepository.findAndCount({
        where,
        relations: ['votes'],
        order: {
          createdAt: sortBy === SubmissionSortByEnum.Oldest ? 'ASC' : 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    const uniqueUserIds = [
      ...new Set([
        ...rss.map((rs) => rs.userId),
        ...rss.flatMap((rs) => rs.votes?.map((vote) => vote.userId) || []),
      ]),
    ];

    const users = await this.usersService.getUsersByIds(uniqueUserIds);

    return {
      artists: rss.map(({ ...rs }) => ({
        ...rs,
        user: users.find((u) => u.id === rs.userId),
        votes:
          rs.votes?.map((vote) => ({
            id: vote.id,
            type: vote.type,
            userId: vote.userId,
            user: users.find((u) => u.id === vote.userId),
            createdAt: vote.createdAt,
          })) || [],
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
    status,
    labelId,
    userId,
    sortBy,
  }: FindLabelSubmissionsDto): Promise<ILabelSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (status) where.submissionStatus = status;
    if (labelId) where.labelId = labelId;
    if (userId) where.userId = userId;

    const [rss, totalItems] = await this.labelSubmissionRepository.findAndCount(
      {
        where,
        relations: ['votes'],
        order: {
          createdAt: sortBy === SubmissionSortByEnum.Oldest ? 'ASC' : 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    );

    const uniqueUserIds = [
      ...new Set([
        ...rss.map((rs) => rs.userId),
        ...rss.flatMap((rs) => rs.votes?.map((vote) => vote.userId) || []),
      ]),
    ];

    const users = await this.usersService.getUsersByIds(uniqueUserIds);

    return {
      labels: rss.map(({ ...rs }) => ({
        ...rs,
        user: users.find((u) => u.id === rs.userId),
        votes:
          rs.votes?.map((vote) => ({
            id: vote.id,
            type: vote.type,
            userId: vote.userId,
            user: users.find((u) => u.id === vote.userId),
            createdAt: vote.createdAt,
          })) || [],
      })),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + rss.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async getGenreSubmissions({
    page,
    status,
    genreId,
    userId,
    sortBy,
  }: FindGenreSubmissionsDto): Promise<IGenreSubmissionsResponse> {
    const pageSize = 24;
    const where: any = {};

    if (status) where.submissionStatus = status;
    if (genreId) where.genreId = genreId;
    if (userId) where.userId = userId;

    const [rss, totalItems] = await this.genreSubmissionRepository.findAndCount(
      {
        where,
        relations: ['votes'],
        order: {
          createdAt: sortBy === SubmissionSortByEnum.Oldest ? 'ASC' : 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    );

    const uniqueUserIds = [
      ...new Set([
        ...rss.map((rs) => rs.userId),
        ...rss.flatMap((rs) => rs.votes?.map((vote) => vote.userId) || []),
      ]),
    ];

    const users = await this.usersService.getUsersByIds(uniqueUserIds);

    return {
      genres: rss.map(({ ...rs }) => ({
        ...rs,
        user: users.find((u) => u.id === rs.userId),
        votes:
          rs.votes?.map((vote) => ({
            id: vote.id,
            type: vote.type,
            userId: vote.userId,
            user: users.find((u) => u.id === vote.userId),
            createdAt: vote.createdAt,
          })) || [],
      })),
      totalItems,
      currentPage: page,
      currentItems: (page - 1) * pageSize + rss.length,
      itemsPerPage: pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  // --- User contributions stats
  async getUserContributionsStats(userId: string) {
    const [
      addedReleases,
      addedArtists,
      addedLabels,
      editedReleases,
      editedArtists,
      editedLabels,
    ] = await Promise.all([
      this.releaseSubmissionRepository.count({
        where: {
          userId,
          submissionType: SubmissionType.CREATE,
          submissionStatus: In([
            SubmissionStatus.APPROVED,
            SubmissionStatus.AUTO_APPROVED,
          ]),
        },
      }),
      this.artistSubmissionRepository.count({
        where: {
          userId,
          submissionType: SubmissionType.CREATE,
          submissionStatus: In([
            SubmissionStatus.APPROVED,
            SubmissionStatus.AUTO_APPROVED,
          ]),
        },
      }),
      this.labelSubmissionRepository.count({
        where: {
          userId,
          submissionType: SubmissionType.CREATE,
          submissionStatus: In([
            SubmissionStatus.APPROVED,
            SubmissionStatus.AUTO_APPROVED,
          ]),
        },
      }),
      this.releaseSubmissionRepository.count({
        where: {
          userId,
          submissionType: SubmissionType.UPDATE,
          submissionStatus: In([
            SubmissionStatus.APPROVED,
            SubmissionStatus.AUTO_APPROVED,
          ]),
        },
      }),
      this.artistSubmissionRepository.count({
        where: {
          userId,
          submissionType: SubmissionType.UPDATE,
          submissionStatus: In([
            SubmissionStatus.APPROVED,
            SubmissionStatus.AUTO_APPROVED,
          ]),
        },
      }),
      this.labelSubmissionRepository.count({
        where: {
          userId,
          submissionType: SubmissionType.UPDATE,
          submissionStatus: In([
            SubmissionStatus.APPROVED,
            SubmissionStatus.AUTO_APPROVED,
          ]),
        },
      }),
    ]);

    return {
      addedReleases,
      addedArtists,
      addedLabels,
      editedReleases,
      editedArtists,
      editedLabels,
    };
  }

  // --- Discard current user's submissions

  async discardMyArtistSubmission(submissionId: string, userId: string) {
    const submission = await this.artistSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });
    if (
      !submission ||
      submission.userId !== userId ||
      dayjs().diff(submission.createdAt, 'hour') > 1
    ) {
      throw new BadRequestException();
    }

    if (
      submission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
      submission.submissionType === SubmissionType.CREATE
    ) {
      await this.artistsService.deleteArtist(submission.artistId);
      await this.artistSubmissionRepository.delete(submissionId);
    } else if (submission.submissionStatus === SubmissionStatus.OPEN) {
      await this.artistSubmissionRepository.delete(submissionId);
    }

    return {
      message: 'Deleted successfully!',
    };
  }

  async discardMyLabelSubmission(submissionId: string, userId: string) {
    const submission = await this.labelSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });
    if (
      !submission ||
      submission.userId !== userId ||
      dayjs().diff(submission.createdAt, 'hour') > 1
    ) {
      throw new BadRequestException();
    }

    if (
      submission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
      submission.submissionType === SubmissionType.CREATE
    ) {
      await this.labelsService.deleteLabel(submission.labelId);
      await this.labelSubmissionRepository.delete(submissionId);
    } else if (submission.submissionStatus === SubmissionStatus.OPEN) {
      await this.labelSubmissionRepository.delete(submissionId);
    }

    return {
      message: 'Deleted successfully!',
    };
  }

  async discardMyReleaseSubmission(submissionId: string, userId: string) {
    const submission = await this.releaseSubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });
    if (
      !submission ||
      submission.userId !== userId ||
      dayjs().diff(submission.createdAt, 'hour') > 1
    ) {
      throw new BadRequestException();
    }

    if (
      submission.submissionStatus === SubmissionStatus.AUTO_APPROVED &&
      submission.submissionType === SubmissionType.CREATE
    ) {
      await this.releasesService.deleteRelease(submission.releaseId);
      await this.releaseSubmissionRepository.delete(submissionId);
    } else if (submission.submissionStatus === SubmissionStatus.OPEN) {
      await this.releaseSubmissionRepository.delete(submissionId);
    }

    return {
      message: 'Deleted successfully!',
    };
  }
}
