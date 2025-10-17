import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArtistDto, IArtistResponse } from 'shared';
import { Repository } from 'typeorm';
import { ArtistSubmission } from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { genId } from '../common/genId';
import { EntitiesService } from '../entities/entities.service';
import { ReleasesService } from '../releases/releases.service';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,
    @InjectRepository(ArtistSubmission)
    private artistSubmissionRepository: Repository<ArtistSubmission>,
    @InjectRepository(ReleaseArtist)
    private releaseArtistRepository: Repository<ReleaseArtist>,
    private releasesService: ReleasesService,
    private entitiesService: EntitiesService,
  ) {}

  async findOneWithReleases(id: string): Promise<IArtistResponse> {
    const artist = await this.artistsRepository.findOne({ where: { id } });

    if (!artist) throw new NotFoundException();

    const releases = await this.releasesService.getReleasesByArtist(artist.id);

    return {
      artist,
      releases,
    };
  }

  async create({ name, nameLatin }: CreateArtistDto) {
    const id = genId();

    // use `insert` to prevent accidental overwrite
    await this.artistsRepository.insert({
      id,
      name,
      nameLatin,
    });

    const artist = await this.artistsRepository.findOne({ where: { id } });

    return artist;
  }

  async updateArtist({
    artistId,
    changes: { name, nameLatin },
  }: {
    artistId: string;
    changes: { name: string; nameLatin?: string };
  }): Promise<Artist> {
    const artist = await this.artistsRepository.findOne({
      where: { id: artistId },
    });

    if (!artist) throw new NotFoundException();

    artist.name = name;
    artist.nameLatin = nameLatin;
    return this.artistsRepository.save(artist);
  }

  async deleteArtist(id: string) {
    return await this.artistsRepository.delete(id);
  }

  async mergeArtists(mergeFromId: string, mergeIntoId: string) {
    const mergeFrom = await this.artistsRepository.findOne({
      where: { id: mergeFromId },
    });
    const mergeInto = await this.artistsRepository.findOne({
      where: { id: mergeIntoId },
    });

    if (!mergeFrom || !mergeInto) {
      throw new Error('One or both artists not found');
    }

    await this.entitiesService.mergeArtistActivities(mergeFromId, mergeIntoId);

    await this.entitiesService.disapproveSubmissionsForEntity(
      'artist',
      mergeFromId,
    );

    await this.artistsRepository.delete(mergeFromId);

    return {
      mergedFrom: mergeFrom.name,
      mergedInto: mergeInto.name,
    };
  }
}
