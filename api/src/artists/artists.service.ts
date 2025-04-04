import {
  CreateArtistDto,
  IArtistResponse,
  SubmissionStatus,
  SubmissionType,
} from 'shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleasesService } from '../releases/releases.service';
import { SubmissionService } from '../submission/submission.service';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,
    @InjectRepository(ArtistSubmission)
    private artistSubmissionRepository: Repository<ArtistSubmission>,
    private releasesService: ReleasesService,
    private submissionService: SubmissionService,
  ) {}

  async findOneWithReleases(id: string): Promise<IArtistResponse> {
    const artist = await this.artistsRepository.findOne({ where: { id } });

    const releases = await this.releasesService.getReleasesByArtist(artist.id);

    return {
      artist,
      releases,
    };
  }

  async create({ name }: CreateArtistDto, userId: string) {
    const artist = new Artist();

    artist.name = name;

    const newArtist = await this.artistsRepository.save(artist);

    const artistSubmission = new ArtistSubmission();

    artistSubmission.changes = {
      name,
    };

    artistSubmission.submissionType = SubmissionType.CREATE;
    artistSubmission.submissionStatus = SubmissionStatus.APPROVED;
    artistSubmission.artistId = artist.id;
    artistSubmission.userId = userId;

    await this.artistSubmissionRepository.save(artistSubmission);

    return {
      artist: newArtist,
      message: `"${name}" has been added successfully`,
    };
  }
}
