import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { EntriesSortByEnum } from 'shared';
import { Button } from '../../components/button';
import { Feedback } from '../../components/feedback';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Sidebar } from '../../components/sidebar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
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
  collectionViewId,
}: {
  userId: string;
  collectionViewId: string;
}) => {
  const { sortBy } = useSortBy();
  const [query] = useSearchParams();

  const genresParam = query.getAll('genres');
  const artistsParam = query.getAll('artists');
  const labelsParam = query.getAll('labels');
  const tagsParam = query.getAll('tags');
  const typesParam = query.getAll('types');

  const filters = {
    year: query.get('year') || undefined,
    decade: query.get('decade') || undefined,
    bucket: query.get('bucket') || undefined,
    genres: genresParam.length > 0 ? genresParam : undefined,
    artists: artistsParam.length > 0 ? artistsParam : undefined,
    labels: labelsParam.length > 0 ? labelsParam : undefined,
    tags: tagsParam.length > 0 ? tagsParam : undefined,
    types: typesParam.length > 0 ? typesParam.map(Number) : undefined,
  };

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.entriesKey({
        userId,
        pageSize: 48,
        ...filters,
        sortBy,
        collectionViewId,
      }),
      async ({ pageParam = 1 }) =>
        api.getEntries({
          userId,
          page: pageParam,
          pageSize: 48,
          ...filters,
          sortBy,
          collectionViewId,
        }),
      {
        getNextPageParam: (lastPage) =>
          lastPage.currentPage < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  return (
    <Stack>
      {isFetching && !isFetchingNextPage && !data ? <Loading /> : null}
      {!isFetching && !isFetchingNextPage && !data?.pages[0].totalItems ? (
        <Feedback message="There are no releases" />
      ) : null}
      {data && data.pages[0].totalItems > 0 ? (
        <UserMusicVirtualGrid
          ratings={data}
          loadMore={fetchNextPage}
          hasMore={!!hasNextPage}
        />
      ) : null}
    </Stack>
  );
};

const UserMusicPage = () => {
  const { user, stats, collectionViews } =
    useOutletContext<UserPageOutletContext>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMobile = useMediaQuery({ down: 'md' });

  const [query, setQuery] = useSearchParams();

  const [componentReady, setComponentReady] = useState(false);

  const selectedViewId = query.get('view');

  useEffect(() => {
    if (collectionViews && collectionViews.length > 0 && !selectedViewId) {
      const params = new URLSearchParams();
      params.set('view', collectionViews[0].id);
      setQuery(params, { replace: true, preventScrollReset: true });
    }
    setComponentReady(true);
  }, [collectionViews]);

  const handleViewClick = (id: string) => {
    const params = new URLSearchParams(); // clear all filters on view change
    if (selectedViewId !== id) {
      params.set('view', id);
    }
    setQuery(params, { replace: true, preventScrollReset: true });
  };

  if (!componentReady) return <></>;

  return (
    <Stack gap="md">
      <Group justify="apart">
        <Group gap="sm" wrap>
          {collectionViews && collectionViews.length > 0
            ? collectionViews.map((cv) => (
                <Button
                  key={cv.id}
                  variant={selectedViewId === cv.id ? 'highlight' : undefined}
                  onClick={() => handleViewClick(cv.id)}
                >
                  {cv.title}
                </Button>
              ))
            : null}
        </Group>
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
        <UserMusicFilters
          userId={user.id}
          ratingsCount={stats.ratingsCount}
          collectionView={
            selectedViewId
              ? collectionViews.find((v) => v.id === selectedViewId)
              : null
          }
        />
      </Sidebar>
      <Group align="start" gap="xl">
        <div style={{ flex: 1 }}>
          <Ratings userId={user.id} collectionViewId={selectedViewId} />
        </div>
        {!isMobile && (
          <UserMusicFilters
            userId={user.id}
            ratingsCount={stats.ratingsCount}
            collectionView={
              selectedViewId
                ? collectionViews.find((v) => v.id === selectedViewId)
                : null
            }
          />
        )}
      </Group>
    </Stack>
  );
};
export default UserMusicPage;
