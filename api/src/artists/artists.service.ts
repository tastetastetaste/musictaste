import {
  ArtistStatus,
  CreateArtistDto,
  IArtistResponse,
  SubmissionStatus,
  SubmissionType,
} from 'shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleasesService } from '../releases/releases.service';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,
    @InjectRepository(ArtistSubmission)
    private artistSubmissionRepository: Repository<ArtistSubmission>,
    @InjectRepository(ReleaseArtist)
    private releaseArtistRepository: Repository<ReleaseArtist>,
    private releasesService: ReleasesService,
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

  async softDelete({ id }: { id: string }): Promise<boolean> {
    try {
      await Promise.all([
        this.artistsRepository.update({ id }, { status: ArtistStatus.DELETED }),
        this.releaseArtistRepository.delete({ artistId: id }),
      ]);
      return true;
    } catch (err) {
      return false;
    }
  }
}
