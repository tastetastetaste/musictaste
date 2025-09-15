import { useOutletContext } from 'react-router-dom';
import { SearchArtist } from './search-artist-page';
import { SearchRelease } from './search-release-page';
import { SearchPageOutletContext } from './search-page-wrapper';
import { Typography } from '../../components/typography';
import { Stack } from '../../components/flex/stack';

export const SEARCH_IMAGE_SIZE = '50px';

const SearchPage = () => {
  const { q } = useOutletContext<SearchPageOutletContext>();

  return (
    <Stack gap="sm">
      <Typography size="title-lg">Releases</Typography>
      <SearchRelease q={decodeURIComponent(q)} />
      <Typography size="title-lg">Artists</Typography>
      <SearchArtist q={decodeURIComponent(q)} />
    </Stack>
  );
};

export default SearchPage;
