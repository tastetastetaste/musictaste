import {
  IArtistSummary,
  IGenreSummary,
  ILabelSummary,
  IReleaseSummary,
} from 'shared';
import { Link } from '../../components/links/link';
import {
  getArtistPath,
  getGenrePath,
  getLabelPath,
  getReleasePath,
} from 'shared';
import { Group } from '../../components/flex/group';
import { ArtistsLinks, ReleaseImageLink } from '../releases/release/shared';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';

export const ArtistSearchLink = ({ artist }: { artist: IArtistSummary }) => (
  <Link to={getArtistPath({ artistId: artist.id })}>
    {artist.name}{' '}
    {artist.nameLatin ? (
      <span css={{ fontStyle: 'italic' }}>[{artist.nameLatin}] </span>
    ) : (
      ''
    )}
    {artist.disambiguation || artist.mainArtist ? (
      <span css={{ opacity: 0.6 }}>
        ({artist.disambiguation || artist.mainArtist?.name})
      </span>
    ) : (
      ''
    )}
  </Link>
);

export const LabelSearchLink = ({ label }: { label: ILabelSummary }) => (
  <Link to={getLabelPath({ labelId: label.id })}>
    {label.name}{' '}
    {label.nameLatin ? (
      <span css={{ fontStyle: 'italic' }}>[{label.nameLatin}]</span>
    ) : (
      ''
    )}
    {label.disambiguation ? (
      <span css={{ opacity: 0.6 }}>({label.disambiguation})</span>
    ) : (
      ''
    )}
  </Link>
);

export const GenreSearchLink = ({ genre }: { genre: IGenreSummary }) => (
  <Link to={getGenrePath({ genreId: genre.id })}>{genre.name}</Link>
);

export const ReleaseSearchLink = ({
  release,
}: {
  release: IReleaseSummary;
}) => (
  <Group gap="sm">
    <div css={{ minWidth: '70px' }}>
      <ReleaseImageLink release={release} size="xs" />
    </div>
    <Stack gap="sm">
      <ArtistsLinks artists={release.artists} />
      <Typography inline whiteSpace="nowrap">
        <Link to={getReleasePath({ releaseId: release.id })}>
          {release.title}
          <span css={{ fontStyle: 'italic' }}>
            {release.titleLatin && ` [${release.titleLatin}]`}
          </span>
        </Link>
      </Typography>
    </Stack>
  </Group>
);
