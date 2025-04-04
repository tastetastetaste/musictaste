import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { SearchPageOutletContext } from './search-page-wrapper';
import { ReleaseSearchLink } from './search-links';
import { cacheKeys } from '../../utils/cache-keys';

export const SearchRelease = ({ q }: { q?: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['releases'],
      page: 1,
      pageSize: 12,
    }),
    () =>
      api.search({
        q: q!,
        type: ['releases'],
        page: 1,
        pageSize: 12,
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
