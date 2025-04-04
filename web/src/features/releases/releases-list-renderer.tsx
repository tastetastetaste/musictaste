import { api } from '../../utils/api';
import { useInfiniteQuery } from 'react-query';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import { ReleasesVirtualGrid } from './releases-virtual-grid';
import { cacheKeys } from '../../utils/cache-keys';

export interface ReleasesListRendererProps {
  releasesFor: 'new' | 'popular' | 'recently-added' | 'top';
}

export function ReleasesListRenderer({
  releasesFor,
}: ReleasesListRendererProps) {
  const cacheKey =
    releasesFor === 'new'
      ? cacheKeys.newReleasesKey()
      : releasesFor === 'recently-added'
        ? cacheKeys.recentlyAddedReleasesKey()
        : releasesFor === 'top'
          ? cacheKeys.topReleasesKey()
          : cacheKeys.popularReleasesKey();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKey,
      async ({ pageParam = 1 }) =>
        releasesFor === 'new'
          ? api.getNewReleases(pageParam)
          : releasesFor === 'popular'
            ? api.getPopularReleases(pageParam)
            : releasesFor === 'recently-added'
              ? api.getRecentlyAddedReleases(pageParam)
              : api.getTopReleases(pageParam),
      {
        getNextPageParam: (lastPage, pages) => {
          return pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined;
        },
      },
    );

  return (
    <div>
      {isFetching && !isFetchingNextPage ? (
        <Loading />
      ) : data && data.pages[0].totalItems > 0 ? (
        <ReleasesVirtualGrid
          releases={data}
          loadMore={fetchNextPage}
          hasMore={hasNextPage || false}
        />
      ) : (
        <Feedback message="There are no releases" />
      )}
    </div>
  );
}

export default ReleasesListRenderer;
