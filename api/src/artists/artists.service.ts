import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IArtistResponse } from 'shared';
import { Repository } from 'typeorm';
import {
  ArtistChanges,
  ArtistSubmission,
} from '../../db/entities/artist-submission.entity';
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
    const artist = await this.artistsRepository.findOne({
      where: { id },
      relations: ['mainArtist', 'aliases'],
    });

    if (!artist) throw new NotFoundException();

    const releases = await this.releasesService.getReleasesByArtist(artist.id);

    return {
      artist,
      releases,
    };
  }

  async create({
    name,
    nameLatin,
    type,
    disambiguation,
    members,
    membersSource,
    memberOf,
    memberOfSource,
    relatedArtists,
    relatedArtistsSource,
    aka,
    akaSource,
    mainArtistId,
  }: ArtistChanges) {
    const id = genId();

    // use `insert` to prevent accidental overwrite
    await this.artistsRepository.insert({
      id,
      name,
      nameLatin,
      type,
      disambiguation,
      members,
      membersSource,
      memberOf,
      memberOfSource,
      relatedArtists,
      relatedArtistsSource,
      aka,
      akaSource,
      mainArtistId,
    });

    const artist = await this.artistsRepository.findOne({ where: { id } });

    return artist;
  }

  async updateArtist({
    artistId,
    changes: {
      name,
      nameLatin,
      type,
      disambiguation,
      members,
      membersSource,
      memberOf,
      memberOfSource,
      relatedArtists,
      relatedArtistsSource,
      aka,
      akaSource,
      mainArtistId,
    },
  }: {
    artistId: string;
    changes: ArtistChanges;
  }): Promise<Artist> {
    const artist = await this.artistsRepository.findOne({
      where: { id: artistId },
    });

    if (!artist) throw new NotFoundException();

    artist.name = name;
    artist.nameLatin = nameLatin;
    artist.type = type;
    artist.disambiguation = disambiguation;
    artist.members = members;
    artist.membersSource = membersSource;
    artist.memberOf = memberOf;
    artist.memberOfSource = memberOfSource;
    artist.relatedArtists = relatedArtists;
    artist.relatedArtistsSource = relatedArtistsSource;
    artist.aka = aka;
    artist.akaSource = akaSource;
    artist.mainArtistId = mainArtistId;
    return this.artistsRepository.save(artist);
  }

  async deleteArtist(id: string) {
    return await this.artistsRepository.delete(id);
  }

  async artistNameExists(name: string) {
    return await this.artistsRepository.findOne({ where: { name } });
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
