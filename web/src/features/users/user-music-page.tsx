import { EntriesSortByEnum } from 'shared';
import { api } from '../../utils/api';
import { useEffect } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Dropdown } from '../../components/dropdown';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import UserMusicFilters from './user-music-filters';
import { UserMusicVirtualGrid } from './user-music-virtual-grid';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { UserPageOutletContext } from './user-page-wrapper';
import { cacheKeys } from '../../utils/cache-keys';

const useSortBy = () => {
  const [sortBy, setSortBy] = useLocalStorage<EntriesSortByEnum>(
    'umsbf',
    EntriesSortByEnum.EntryDate,
  );
  const [query, setQuery] = useSearchParams();

  useEffect(() => {
    if (!Object.values(EntriesSortByEnum).includes(sortBy)) {
      setSortBy(EntriesSortByEnum.EntryDate);
    }
  }, [sortBy, setSortBy]);

  const handleChange = ({ value }: { value: EntriesSortByEnum }) =>
    setSortBy(value);

  const clearFilters = () =>
    setQuery([], { replace: true, preventScrollReset: true });

  return {
    sortBy,
    handleChange,
    clearFilters,
  };
};

const Ratings = ({
  userId,
  isUserMyself,
}: {
  userId: string;
  isUserMyself: boolean;
}) => {
  const { sortBy } = useSortBy();
  const [query] = useSearchParams();
  const filters = [
    'tag',
    'year',
    'decade',
    'bucket',
    'genre',
    'artist',
    'label',
  ].reduce(
    (acc, param) => ({ ...acc, [param]: query.get(param) || undefined }),
    {},
  );

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.entriesKey({
        userId,
        pageSize: 48,
        ...filters,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getEntries({
          userId,
          page: pageParam,
          pageSize: 48,
          ...filters,
          sortBy,
        }),
      {
        getNextPageParam: (lastPage) =>
          lastPage.currentPage < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  return (
    <div style={{ minHeight: '100vh' }}>
      {isFetching && !isFetchingNextPage ? (
        <Loading />
      ) : data?.pages[0].totalItems > 0 ? (
        <UserMusicVirtualGrid
          ratings={data}
          loadMore={fetchNextPage}
          hasMore={!!hasNextPage}
        />
      ) : (
        <Feedback message="There are no releases" />
      )}
    </div>
  );
};

const UserMusicPage = () => {
  const { user, stats, isUserMyself } =
    useOutletContext<UserPageOutletContext>();
  const { handleChange, sortBy } = useSortBy();

  return (
    <Stack gap="md">
      <Group justify="apart" align="center">
        <Dropdown
          onChange={handleChange as any}
          name="sb"
          options={[
            { label: 'Date Added', value: EntriesSortByEnum.EntryDate },
            { label: 'Date Rated', value: EntriesSortByEnum.RatingDate },
            {
              label: 'Highest Rating',
              value: EntriesSortByEnum.RatingHighToLow,
            },
            {
              label: 'Lowest Rating',
              value: EntriesSortByEnum.RatingLowToHigh,
            },
            { label: 'Release Date', value: EntriesSortByEnum.ReleaseDate },
          ]}
          defaultValue={sortBy}
          label="Sort By"
        />
        <UserMusicFilters userId={user.id} ratingsCount={stats.ratingsCount} />
      </Group>
      <Ratings userId={user.id} isUserMyself={isUserMyself} />
    </Stack>
  );
};
export default UserMusicPage;
