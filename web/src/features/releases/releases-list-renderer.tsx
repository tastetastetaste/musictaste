import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { SelectGenres } from '../genres/select-genres';
import { Checkbox } from '../../components/inputs/checkbox';
import { Select } from '../../components/inputs/select';

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
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [genreIds, setGenreIds] = useState<string[]>(
    () => params.get('genres')?.split(',') || [],
  );

  const [includeAllGenres, setIncludeAllGenres] = useState(
    () => params.get('includeAll') === 'true',
  );

  const [minRatings, setMinRatings] = useState<number | undefined>(() =>
    params.has('minRatings') ? Number(params.get('minRatings')) : undefined,
  );

  const [maxRatings, setMaxRatings] = useState<number | undefined>(() =>
    params.has('maxRatings') ? Number(params.get('maxRatings')) : undefined,
  );

  const [onlyUpcoming, setOnlyUpcoming] = useState<boolean>(() =>
    params.has('status') ? params.get('status') === 'upcoming' : false,
  );

  const debouncedMinRatings = useDebounce(minRatings, 300);
  const debouncedMaxRatings = useDebounce(maxRatings, 300);

  const cacheKey = cacheKeys.releasesKey({
    type,
    genreId,
    labelId,
    artistId,
    genreIds,
    includeAllGenres,
    onlyUpcoming,
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
          genreIds,
          includeAllGenres,
          onlyUpcoming,
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

  // Update URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (debouncedMaxRatings !== undefined) {
      params.set('maxRatings', debouncedMaxRatings.toString());
    } else {
      params.delete('maxRatings');
    }

    if (debouncedMinRatings !== undefined) {
      params.set('minRatings', debouncedMinRatings.toString());
    } else {
      params.delete('minRatings');
    }

    if (genreIds.length > 0) {
      params.set('genres', genreIds.join(','));
    } else {
      params.delete('genres');
    }

    if (includeAllGenres) {
      params.set('includeAll', 'true');
    } else {
      params.delete('includeAll');
    }

    if (onlyUpcoming) {
      params.set('status', 'upcoming');
    } else {
      params.delete('status');
    }

    navigate(`?${params.toString()}`, { replace: true });
  }, [
    debouncedMaxRatings,
    debouncedMinRatings,
    genreIds,
    includeAllGenres,
    onlyUpcoming,
    navigate,
  ]);

  const showMinAndMaxRatingsFilter =
    isSupporter &&
    (type === FindReleasesType.Top || type === FindReleasesType.TopOTY);
  const showGenresFilter = type === FindReleasesType.Community;
  const showCommunityReleaseStatusFilter = type === FindReleasesType.Community;

  const sidebarContent =
    showMinAndMaxRatingsFilter ||
    showGenresFilter ||
    showCommunityReleaseStatusFilter ? (
      <Stack gap="lg">
        {showMinAndMaxRatingsFilter ? (
          <>
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
          </>
        ) : null}
        {showCommunityReleaseStatusFilter ? (
          <Stack>
            <label>Status</label>
            <Select
              options={[
                { value: '', label: 'Released' },
                { value: 'upcoming', label: 'Upcoming' },
              ]}
              value={
                onlyUpcoming
                  ? { value: 'upcoming', label: 'Upcoming' }
                  : { value: '', label: 'Released' }
              }
              onChange={(v) => setOnlyUpcoming(v?.value === 'upcoming')}
            />
          </Stack>
        ) : null}
        {showGenresFilter ? (
          <>
            <Stack>
              <label>Genres</label>
              <SelectGenres
                onChange={(g: string[]) => {
                  setGenreIds(g);
                }}
                isMulti
                value={genreIds}
              />
              <Checkbox
                label="Include all genres"
                name="includeAllGenres"
                value={includeAllGenres}
                onChange={(v) => setIncludeAllGenres(v)}
              />
            </Stack>
          </>
        ) : null}
      </Stack>
    ) : null;

  const sidebar = sidebarContent ? (
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
        {sidebarContent}
      </Sidebar>
    </>
  ) : null;

  return (
    <Stack gap="md">
      {sidebar}
      {isFetching && !isFetchingNextPage ? <Loading /> : null}
      {!isFetching && !isFetchingNextPage && !data?.pages[0].totalItems ? (
        <Feedback message="There are no releases" />
      ) : null}

      {data && data.pages[0].totalItems > 0 ? (
        <ReleasesVirtualGrid
          releases={data}
          loadMore={fetchNextPage}
          hasMore={hasNextPage || false}
          manualLoad={manualLoad}
        />
      ) : null}
    </Stack>
  );
}

export default ReleasesListRenderer;
