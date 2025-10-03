import { IArtistSummary, IReleaseSummary } from 'shared';
import { Link } from '../../components/links/link';
import {
  getArtistPath,
  getGenrePath,
  getLabelPath,
  getReleasePath,
} from 'shared';
import { Group } from '../../components/flex/group';
import { ReleaseImageLink } from '../releases/release/shared';

export const ArtistSearchLink = ({ artist }: { artist: IArtistSummary }) => (
  <Link to={getArtistPath({ artistId: artist.id })}>
    {artist.name}{' '}
    {artist.nameLatin ? (
      <span css={{ fontStyle: 'italic' }}>[{artist.nameLatin}]</span>
    ) : (
      ''
    )}
  </Link>
);

export const LabelSearchLink = ({ label }: { label: IArtistSummary }) => (
  <Link to={getLabelPath({ labelId: label.id })}>{label.name}</Link>
);

export const GenreSearchLink = ({ genre }: { genre: IArtistSummary }) => (
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
    <Link to={getReleasePath({ releaseId: release.id })}>
      {release.title}
      <span css={{ fontStyle: 'italic' }}>
        {release.titleLatin && ` [${release.titleLatin}]`}
      </span>
    </Link>
  </Group>
);
