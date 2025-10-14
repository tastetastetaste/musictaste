import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ReleaseSearchLink } from './search-links';
import { SearchPageOutletContext } from './search-page-wrapper';

export const SearchRelease = ({ q }: { q?: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['releases'],
      page: 1,
      pageSize: 50,
    }),
    () =>
      api.search({
        q: q!,
        type: ['releases'],
        page: 1,
        pageSize: 50,
      }),
    { enabled: !!q },
  );

  const releases = data?.releases;

  if (!q) return null;

  if (isLoading) return <span>loading</span>;

  if (releases && releases.length === 0) return null;

  return (
    <Fragment>
      <Stack gap="sm">
        {releases &&
          releases.map((release) => (
            <ReleaseSearchLink key={release.id} release={release} />
          ))}
      </Stack>
    </Fragment>
  );
};
const SearchReleasePage = () => {
  const { q } = useOutletContext<SearchPageOutletContext>();

  return <SearchRelease q={q} />;
};

export default SearchReleasePage;
