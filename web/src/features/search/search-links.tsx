import { IArtistSummary, IReleaseSummary } from 'shared';
import { Link } from '../../components/links/link';
import {
  getArtistPathname,
  getReleasePathname,
} from '../../utils/get-pathname';
import { Group } from '../../components/flex/group';
import { ReleaseImageLink } from '../releases/release/shared';

export const ArtistSearchLink = ({ artist }: { artist: IArtistSummary }) => (
  <Link to={getArtistPathname(artist.id)}>{artist.name}</Link>
);

export const ReleaseSearchLink = ({
  release,
}: {
  release: IReleaseSummary;
}) => (
  <Group gap="sm">
    <ReleaseImageLink release={release} size="xs" />
    <Link to={getReleasePathname(release.id)}>{release.title}</Link>
  </Group>
);
