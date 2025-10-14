import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ArtistSearchLink } from './search-links';
import { SearchPageOutletContext } from './search-page-wrapper';

export const SearchArtist = ({ q }: { q: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['artists'],
      page: 1,
      pageSize: 100,
    }),
    () =>
      api.search({
        q: q!,
        type: ['artists'],
        page: 1,
        pageSize: 100,
      }),
    { enabled: !!q },
  );

  const artists = data?.artists;

  if (!q) return null;

  if (isLoading) return <span>loading</span>;

  if (artists && artists.length === 0) return null;

  return (
    <Fragment>
      <Stack gap="md">
        {artists &&
          artists.map((artist) => (
            <ArtistSearchLink key={artist.id} artist={artist} />
          ))}
      </Stack>
    </Fragment>
  );
};

const SearchArtistPage = () => {
  const { q } = useOutletContext<SearchPageOutletContext>();

  return <SearchArtist q={q} />;
};

export default SearchArtistPage;
