import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Release } from '../../db/entities/release.entity';
import { In, Repository } from 'typeorm';
import { Artist } from '../../db/entities/artist.entity';
import { Label } from '../../db/entities/label.entity';
import { Genre } from '../../db/entities/genre.entity';
import {
  getArtistPath,
  getGenrePath,
  getLabelPath,
  getReleasePath,
} from 'shared';

@Injectable()
export class EntitiesReferenceService {
  constructor(
    @InjectRepository(Release)
    private releaseRepository: Repository<Release>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}
  private readonly REFERENCE_PATTERN = /\[\[([^\]]+)\]\]/g;
  async parseLinks(source: string): Promise<string> {
    // No source
    if (!source) return source;

    const matches = Array.from(source.matchAll(this.REFERENCE_PATTERN));

    // No matches
    if (matches.length === 0) return source;

    // Extract ids
    const { releaseIds, artistIds, labelIds, genreIds } =
      this.extractEntityIds(matches);

    // Fetch entities
    const entityMap = await this.fetchAllEntities({
      releaseIds: [...new Set(releaseIds)],
      artistIds: [...new Set(artistIds)],
      labelIds: [...new Set(labelIds)],
      genreIds: [...new Set(genreIds)],
    });

    // Replace matches
    const result = source.replace(this.REFERENCE_PATTERN, (match, content) => {
      const [type, id] = content.split('/');

      if (!type || !id) return `[[${content}]]`; // Invalid format

      let name: string | undefined;
      let path: string;

      switch (type) {
        case 'release':
          name = entityMap.releases.get(id);
          path = getReleasePath({ releaseId: id });
          break;
        case 'artist':
          name = entityMap.artists.get(id);
          path = getArtistPath({ artistId: id });
          break;
        case 'label':
          name = entityMap.labels.get(id);
          path = getLabelPath({ labelId: id });
          break;
        case 'genre':
          name = entityMap.genres.get(id);
          path = getGenrePath({ genreId: id });
          break;
        default:
          // Unknown type
          return `[[${content}]]`;
      }

      const displayName = name || `${type.toUpperCase()} NOT FOUND`;
      return `[${displayName}](${path})`;
    });

    return result;
  }

  private extractEntityIds(matches: RegExpMatchArray[]) {
    const releaseIds: string[] = [];
    const artistIds: string[] = [];
    const labelIds: string[] = [];
    const genreIds: string[] = [];

    for (const match of matches) {
      const content = match[1];
      const [type, id] = content.split('/');

      if (!type || !id) continue;

      switch (type) {
        case 'release':
          releaseIds.push(id);
          break;
        case 'artist':
          artistIds.push(id);
          break;
        case 'label':
          labelIds.push(id);
          break;
        case 'genre':
          genreIds.push(id);
          break;
      }
    }

    return { releaseIds, artistIds, labelIds, genreIds };
  }

  private async fetchAllEntities(ids: {
    releaseIds: string[];
    artistIds: string[];
    labelIds: string[];
    genreIds: string[];
  }) {
    const releases = await this.releaseRepository.find({
      where: { id: In(ids.releaseIds) },
      select: ['id', 'title'],
    });
    const artists = await this.artistRepository.find({
      where: { id: In(ids.artistIds) },
      select: ['id', 'name'],
    });
    const labels = await this.labelRepository.find({
      where: { id: In(ids.labelIds) },
      select: ['id', 'name'],
    });
    const genres = await this.genreRepository.find({
      where: { id: In(ids.genreIds) },
      select: ['id', 'name'],
    });
    return {
      releases: new Map(releases.map((release) => [release.id, release.title])),
      artists: new Map(artists.map((artist) => [artist.id, artist.name])),
      labels: new Map(labels.map((label) => [label.id, label.name])),
      genres: new Map(genres.map((genre) => [genre.id, genre.name])),
    };
  }
}
