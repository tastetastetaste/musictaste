import { api } from '../../utils/api';
import { useInfiniteQuery } from 'react-query';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import { ReleasesVirtualGrid } from './releases-virtual-grid';
import { cacheKeys } from '../../utils/cache-keys';
import { FindReleasesType } from 'shared';

export interface ReleasesListRendererProps {
  type: FindReleasesType;
}

export function ReleasesListRenderer({ type }: ReleasesListRendererProps) {
  const cacheKey = cacheKeys.releasesKey(type);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKey,
      async ({ pageParam = 1 }) => api.getReleases(type as any, pageParam),
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
