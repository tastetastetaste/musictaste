import { useInfiniteQuery } from '@tanstack/react-query';
import {
  FindReleasesType,
  ReleaseType,
  TOP_RELEASES_OAT_MIN_RATINGS_COUNT,
  TOP_RELEASES_OTY_MIN_RATINGS_COUNT,
} from 'shared';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ReleasesVirtualGrid } from './releases-virtual-grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../account/useAuth';
import { Sidebar } from '../../components/sidebar';
import { Input } from '../../components/inputs/input';
import { Group } from '../../components/flex/group';
import { Button } from '../../components/button';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Stack } from '../../components/flex/stack';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

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
  const { isSupporter } = useAuth();

  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [minRatings, setMinRatings] = useState<number | undefined>(undefined);
  const [maxRatings, setMaxRatings] = useState<number | undefined>(undefined);

  const debouncedMinRatings = useDebounce(minRatings, 300);
  const debouncedMaxRatings = useDebounce(maxRatings, 300);

  const cacheKey = cacheKeys.releasesKey({
    type,
    genreId,
    labelId,
    artistId,
    releaseType,
    includeAliases,
    minRatings: debouncedMinRatings,
    maxRatings: debouncedMaxRatings,
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
          debouncedMinRatings,
          debouncedMaxRatings,
        ),
      {
        getNextPageParam: (lastPage, pages) => {
          return pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined;
        },
      },
    );

  useEffect(() => {
    // update query params

    const params = new URLSearchParams(window.location.search);
    if (debouncedMaxRatings) {
      params.set('maxRatings', debouncedMaxRatings.toString());
    } else {
      params.delete('maxRatings');
    }
    if (debouncedMinRatings) {
      params.set('minRatings', debouncedMinRatings.toString());
    } else {
      params.delete('minRatings');
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [debouncedMaxRatings, debouncedMinRatings]);

  useEffect(() => {
    // update query params
    const params = new URLSearchParams(window.location.search);
    if (params.has('maxRatings')) {
      setMaxRatings(Number(params.get('maxRatings')));
    }
    if (params.has('minRatings')) {
      setMinRatings(Number(params.get('minRatings')));
    }
  }, []);

  useEffect(() => {
    // reset on props change
    if (maxRatings || minRatings) {
      setMinRatings(undefined);
      setMaxRatings(undefined);
    }
  }, [type]);

  return (
    <Stack gap="md">
      {/* Releases filters */}
      {isSupporter &&
        (type === FindReleasesType.Top || type === FindReleasesType.TopOTY) && (
          <>
            <Group justify="end">
              <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <IconAdjustmentsHorizontal />
              </Button>
            </Group>
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              position="right"
            >
              <Stack gap="sm">
                <Stack>
                  <label>Min ratings</label>
                  <Input
                    placeholder={`Min ratings (default: ${type === FindReleasesType.Top ? TOP_RELEASES_OAT_MIN_RATINGS_COUNT : type === FindReleasesType.TopOTY ? TOP_RELEASES_OTY_MIN_RATINGS_COUNT : 0})`}
                    type="number"
                    value={minRatings}
                    onChange={(e) =>
                      setMinRatings(Number(e.target.value) || undefined)
                    }
                  />
                </Stack>
                <Stack>
                  <label>Max ratings</label>
                  <Input
                    placeholder="Max ratings"
                    type="number"
                    value={maxRatings}
                    onChange={(e) =>
                      setMaxRatings(Number(e.target.value) || undefined)
                    }
                  />
                </Stack>
              </Stack>
            </Sidebar>
          </>
        )}
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
    </Stack>
  );
}

export default ReleasesListRenderer;
