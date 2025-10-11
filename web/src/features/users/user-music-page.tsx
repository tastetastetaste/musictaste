import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { EntriesSortByEnum } from 'shared';
import { Button } from '../../components/button';
import { Feedback } from '../../components/feedback';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Sidebar } from '../../components/sidebar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import UserMusicFilters from './user-music-filters';
import { UserMusicVirtualGrid } from './user-music-virtual-grid';
import { UserPageOutletContext } from './user-page-wrapper';

export const useSortBy = () => {
  const [query, setQuery] = useSearchParams();
  const sortByParam = query.get('sb');
  const sortBy = Object.values(EntriesSortByEnum).includes(
    sortByParam as EntriesSortByEnum,
  )
    ? (sortByParam as EntriesSortByEnum)
    : EntriesSortByEnum.ReleaseDate;

  const handleChange = ({ value }: { value: EntriesSortByEnum }) => {
    setQuery(
      { ...Object.fromEntries(query.entries()), sb: value },
      { replace: true, preventScrollReset: true },
    );
  };

  return {
    sortBy,
    handleChange,
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
    'type',
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMobile = useMediaQuery({ down: 'md' });

  return (
    <Stack gap="md">
      <Group justify="end">
        {isMobile && (
          <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <IconAdjustmentsHorizontal />
          </Button>
        )}
      </Group>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        position="right"
      >
        <UserMusicFilters userId={user.id} ratingsCount={stats.ratingsCount} />
      </Sidebar>
      <Group align="start" gap="lg">
        <div style={{ flex: 1 }}>
          <Ratings userId={user.id} isUserMyself={isUserMyself} />
        </div>
        {!isMobile && (
          <UserMusicFilters
            userId={user.id}
            ratingsCount={stats.ratingsCount}
          />
        )}
      </Group>
    </Stack>
  );
};
export default UserMusicPage;
