import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { ITrack, MusicBrainzApi } from 'musicbrainz-api';
import { IAutofillRelease } from 'shared';

@Injectable()
export class AutofillService {
  private musicBrainzApi: MusicBrainzApi;
  constructor(private configService: ConfigService) {
    this.musicBrainzApi = new MusicBrainzApi({
      appName: 'music taste',
      appVersion: '1.0.0',
      appContactInfo: this.configService.get('FRONTEND_URL'),
    });
  }

  async musicbrainz(mbid: string): Promise<IAutofillRelease> {
    let cover;
    try {
      cover = await Promise.race([
        new Promise<string>((res, rej) => {
          fetch('https://coverartarchive.org/release/' + mbid)
            .then((response) => response.json())
            .then((data: any) => {
              if (data.images && data.images.length !== 0) {
                const img = data['images'].filter((i: any) =>
                  i.types.includes('Front'),
                );
                res(img[0].image);
              } else {
                rej('No front cover image found');
              }
            })
            .catch((err) => {
              rej(err);
            });
        }),
        new Promise<null>((_, rej) =>
          setTimeout(() => rej('Request timed out'), 15000),
        ),
      ]);
    } catch (err) {}

    let release;
    try {
      release = await this.musicBrainzApi.lookupRelease(mbid, [
        'recordings',
        'artist-credits',
        'labels',
      ]);
    } catch (error) {
      console.error('MusicBrainz API error:', error.message);
      return null;
    }

    if (!release) {
      return null;
    }

    const allTracks: (ITrack & { disk: number })[] = [];

    const isMultiDisc = release.media.length > 1;

    release.media.forEach((m) => {
      allTracks.push(...m.tracks.map((t) => ({ ...t, disk: m.position })));
    });

    const artists = release['artist-credit'].map((a) => ({
      name: a.artist.name,
    }));
    const labels = release['label-info']
      ?.map((l) => (l.label ? { name: l.label.name } : null))
      .filter(Boolean);

    return {
      id: release.id,
      imageUrl: cover,
      artists,
      labels,
      title: release.title,
      type: release['primary-type'],
      date: dayjs(release.date).format('YYYY-MM-DD').toString(),
      tracks: allTracks.map((t) => ({
        track: isMultiDisc ? `${t.disk}.${t.number}` : `${t.number}`,
        title: t.title,
        durationMs: t.length,
      })),
    };
  }
}
