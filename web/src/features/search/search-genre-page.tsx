import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { GenreSearchLink } from './search-links';
import { SearchPageOutletContext } from './search-page-wrapper';

export const SearchGenre = ({ q }: { q: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['genres'],
      page: 1,
      pageSize: 100,
    }),
    () =>
      api.search({
        q: q!,
        type: ['genres'],
        page: 1,
        pageSize: 100,
      }),
    { enabled: !!q },
  );

  const genres = data?.genres;

  if (!q) return null;

  if (isLoading) return <span>loading</span>;

  if (genres && genres.length === 0) return null;

  return (
    <Fragment>
      <Stack gap="md">
        {genres &&
          genres.map((genre) => (
            <GenreSearchLink key={genre.id} genre={genre} />
          ))}
      </Stack>
    </Fragment>
  );
};

const SearchGenrePage = () => {
  const { q } = useOutletContext<SearchPageOutletContext>();

  return <SearchGenre q={q} />;
};

export default SearchGenrePage;
