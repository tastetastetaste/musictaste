import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtistType, IArtistResponse } from 'shared';
import { In, Repository } from 'typeorm';
import {
  ArtistChanges,
  ArtistSubmission,
} from '../../db/entities/artist-submission.entity';
import { Artist } from '../../db/entities/artist.entity';
import { ReleaseArtist } from '../../db/entities/release-artist.entity';
import { genId } from '../common/genId';
import { EntitiesService } from '../entities/entities.service';
import { ReleasesService } from '../releases/releases.service';
import { RelatedArtist } from '../../db/entities/related-artist.entity';
import { GroupArtist } from '../../db/entities/group-artist.entity';
import { compareIds } from '../common/compareIds';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private artistsRepository: Repository<Artist>,
    @InjectRepository(ArtistSubmission)
    private artistSubmissionRepository: Repository<ArtistSubmission>,
    @InjectRepository(ReleaseArtist)
    private releaseArtistRepository: Repository<ReleaseArtist>,
    @InjectRepository(RelatedArtist)
    private relatedArtistRepository: Repository<RelatedArtist>,
    @InjectRepository(GroupArtist)
    private groupArtistRepository: Repository<GroupArtist>,
    private releasesService: ReleasesService,
    private entitiesService: EntitiesService,
  ) {}

  async findOne(id: string): Promise<IArtistResponse> {
    const artist = await this.artistsRepository.findOne({
      where: { id },
      relations: [
        'aliases',
        'related',
        'relatedTo',
        'groupArtists',
        'groups',
        'country',
      ],
    });

    if (!artist) throw new NotFoundException();

    const aliasIds = artist.aliases?.map((a) => a.id) || [];

    const [releaseCounts, releaseCountsWithAliases] = await Promise.all([
      this.releasesService.getArtistReleaseCounts(artist.id),
      aliasIds.length > 0
        ? this.releasesService.getArtistReleaseCounts([artist.id, ...aliasIds])
        : null,
    ]);

    const linkedArtistsIds = [
      ...new Set([
        artist.mainArtistId,
        ...artist.relatedTo?.flatMap((ra) => ra.targetId),
        ...artist.related?.flatMap((ra) => ra.sourceId),
        ...artist.groupArtists?.flatMap((ga) => ga.artistId),
        ...artist.groups?.flatMap((ga) => ga.groupId),
      ]),
    ];

    const linkedArtists = await this.artistsRepository.find({
      where: { id: In(linkedArtistsIds) },
    });

    const linkedArtistsMap = new Map(linkedArtists.map((a) => [a.id, a]));

    return {
      artist: {
        ...artist,
        mainArtist: linkedArtistsMap.get(artist.mainArtistId),
        relatedArtists: [
          ...artist.relatedTo?.map((ra) => linkedArtistsMap.get(ra.targetId)),
          ...artist.related?.map((ra) => linkedArtistsMap.get(ra.sourceId)),
        ],
        groupArtists: artist.groupArtists.map((ga) => ({
          artist: linkedArtistsMap.get(ga.artistId),
          current: ga.current,
        })),
        groups: artist.groups?.map((ga) => ({
          group: linkedArtistsMap.get(ga.groupId),
          current: ga.current,
        })),
      },
      releaseCounts,
      releaseCountsWithAliases,
    };
  }

  async create({
    name,
    nameLatin,
    type,
    disambiguation,
    mainArtistId,
    relatedArtistsIds,
    groupArtists,
    countryId,
  }: ArtistChanges) {
    const id = genId();

    // use `insert` to prevent accidental overwrite
    await this.artistsRepository.insert({
      id,
      name,
      nameLatin,
      type,
      disambiguation,
      mainArtistId,
      countryId,
    });

    const artist = await this.artistsRepository.findOne({ where: { id } });

    if (
      type !== ArtistType.Alias &&
      relatedArtistsIds &&
      relatedArtistsIds.length > 0
    ) {
      const uniqueIds = [...new Set(relatedArtistsIds)];
      await this.relatedArtistRepository.insert(
        uniqueIds.map((id) => {
          const [id1, id2] = [artist.id, id].sort();
          return {
            sourceId: id1,
            targetId: id2,
          };
        }),
      );
    }

    if (type === ArtistType.Group && groupArtists && groupArtists.length > 0) {
      await this.groupArtistRepository.insert(
        groupArtists.map((ga) => ({
          groupId: artist.id,
          artistId: ga.artistId,
          current: ga.current,
        })),
      );
    }

    return artist;
  }

  async updateArtist({
    artistId,
    changes: {
      name,
      nameLatin,
      type,
      disambiguation,
      mainArtistId,
      relatedArtistsIds,
      groupArtists,
      countryId,
    },
  }: {
    artistId: string;
    changes: ArtistChanges;
  }): Promise<Artist> {
    const artist = await this.artistsRepository.findOne({
      where: { id: artistId },
      relations: ['aliases', 'related', 'relatedTo', 'groupArtists', 'groups'],
    });

    if (!artist) throw new NotFoundException();

    if (type === ArtistType.Group && artist.groups?.length > 0) {
      throw new BadRequestException(
        'Group artist cannot be updated to a group',
      );
    }

    if (type === ArtistType.Alias && artist.aliases.length > 0) {
      throw new BadRequestException(
        'Main artist with aliases cannot be updated to an alias',
      );
    }

    artist.name = name;
    artist.nameLatin = nameLatin;
    artist.type = type;
    artist.disambiguation = disambiguation;
    artist.mainArtistId = type === ArtistType.Alias ? mainArtistId : null;
    artist.countryId = type !== ArtistType.Alias ? countryId : null;

    if (type !== ArtistType.Alias) {
      const currentRelatedIds = [
        ...(artist.relatedTo?.map((ra) => ra.targetId) || []),
        ...(artist.related?.map((ra) => ra.sourceId) || []),
      ];

      const { addedIds, removedIds } = compareIds(
        relatedArtistsIds,
        currentRelatedIds,
      );

      if (addedIds.length > 0) {
        const uniqueIds = [...new Set(addedIds)];

        await this.relatedArtistRepository.insert(
          uniqueIds.map((id) => {
            const [id1, id2] = [artist.id, id].sort();
            return {
              sourceId: id1,
              targetId: id2,
            };
          }),
        );
      }
      if (removedIds.length > 0) {
        await this.relatedArtistRepository.delete([
          ...removedIds.map((id) => ({
            sourceId: artist.id,
            targetId: id,
          })),
          ...removedIds.map((id) => ({
            sourceId: id,
            targetId: artist.id,
          })),
        ]);
      }
    }

    if (type === ArtistType.Group) {
      const {
        addedIds: addedGroupArtistIds,
        removedIds: removedGroupArtistIds,
        remainingIds: remainingGroupArtistIds,
      } = compareIds(
        groupArtists?.map((ga) => ga.artistId),
        artist.groupArtists?.map((ga) => ga.artistId),
      );

      if (addedGroupArtistIds.length > 0) {
        await this.groupArtistRepository.insert(
          addedGroupArtistIds.map((id) => ({
            groupId: artist.id,
            artistId: id,
            current: groupArtists.find((ga) => ga.artistId === id)?.current,
          })),
        );
      }
      if (removedGroupArtistIds.length > 0) {
        await this.groupArtistRepository.delete(
          removedGroupArtistIds.map((id) => ({
            groupId: artist.id,
            artistId: id,
          })),
        );
      }

      if (remainingGroupArtistIds.length > 0) {
        for (const id of remainingGroupArtistIds) {
          const prevCurrent = artist.groupArtists?.find(
            (ga) => ga.artistId === id,
          )?.current;
          const newCurrent = groupArtists.find(
            (ga) => ga.artistId === id,
          )?.current;

          if (prevCurrent !== newCurrent) {
            await this.groupArtistRepository.update(
              {
                groupId: artist.id,
                artistId: id,
              },
              {
                current: newCurrent,
              },
            );
          }
        }
      }
    }
    if (type !== ArtistType.Group && artist.groupArtists.length) {
      await this.groupArtistRepository.delete(
        artist.groupArtists.map((ga) => ({
          groupId: artist.id,
          artistId: ga.artistId,
        })),
      );
    }
    artist.groupArtists = undefined;
    artist.groups = undefined;
    artist.related = undefined;
    artist.relatedTo = undefined;
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
