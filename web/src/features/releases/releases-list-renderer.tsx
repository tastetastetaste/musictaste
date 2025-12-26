import { useInfiniteQuery } from '@tanstack/react-query';
import { FindReleasesType, ReleaseType } from 'shared';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ReleasesVirtualGrid } from './releases-virtual-grid';

export interface ReleasesListRendererProps {
  type: FindReleasesType;
  genreId?: string;
  labelId?: string;
  artistId?: string;
  releaseType?: ReleaseType;
  includeAliases?: boolean;
  manualLoad?: boolean;
}

export function ReleasesListRenderer({
  type,
  genreId,
  labelId,
  artistId,
  releaseType,
  includeAliases,
  manualLoad,
}: ReleasesListRendererProps) {
  const cacheKey = cacheKeys.releasesKey({
    type,
    genreId,
    labelId,
    artistId,
    releaseType,
    includeAliases,
  });

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKey,
      async ({ pageParam = 1 }) =>
        api.getReleases(
          type as any,
          pageParam,
          48,
          genreId,
          labelId,
          artistId,
          releaseType,
          includeAliases,
        ),
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
          manualLoad={manualLoad}
        />
      ) : (
        <Feedback message="There are no releases" />
      )}
    </div>
  );
}

export default ReleasesListRenderer;
