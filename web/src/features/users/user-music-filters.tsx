import { useTheme } from '@emotion/react';
import {
  IconBuilding,
  IconCalendarTime,
  IconDisc,
  IconMusic,
  IconSortDescending,
  IconTags,
  IconUser,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  EntriesSortByEnum,
  IUserCollectionView,
  IUserCollectionViewFilters,
  MultiValueFilterEnum,
  RatingFilterEnum,
  YearFilterEnum,
} from 'shared';
import { StickyContainer } from '../../components/containers/sticky-container';
import { Stack } from '../../components/flex/stack';
import { Select, SelectOption } from '../../components/inputs/select';
import { Typography } from '../../components/typography';
import { SM_SIDECONTENT_WIDTH } from '../../static/spacing';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SelectArtist } from '../contributions/select-artist';
import { SelectLabel } from '../contributions/select-label';
import { ReleaseTypeOptions2 } from '../contributions/shared';
import { SelectGenres } from '../genres/select-genres';
import { useRatingColor } from '../ratings/useRatingColor';
import { useSortBy } from './user-music-page';

const FilterButton: React.FC<{
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  customCss?: any;
}> = ({ selected, onClick, disabled, children, customCss }) => {
  const theme = useTheme();
  return (
    <button
      css={[
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '8px 12px',
          border: 'none',
          backgroundColor: selected
            ? theme.colors.text
            : theme.colors.background_sub,
          borderRadius: theme.border_radius.base,
          color: selected ? theme.colors.background : theme.colors.text,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.colors.text,
            color: theme.colors.background,
          },
          '&:active': {
            backgroundColor: theme.colors.primary,
            color: theme.colors.background,
          },
          '&:disabled': {
            opacity: 0.5,
          },
        },
        customCss,
      ]}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const FilterByRating: React.FC<{
  name: string;
  buckets?: RatingBucket[];
  allRatingsCount: number;
}> = ({ name, buckets, allRatingsCount }) => {
  const [query, setQuery] = useSearchParams();
  const selected = query.get(name);
  const getColor = useRatingColor();

  return (
    <Stack gap="sm" align="stretch">
      {buckets?.map((bucket) => {
        const percent = allRatingsCount
          ? (bucket.count / allRatingsCount) * 100
          : 0;
        return (
          <FilterButton
            key={bucket.bucket}
            selected={selected === bucket.bucket.toString()}
            onClick={() => {
              const newParams = new URLSearchParams(query);
              selected === bucket.bucket.toString()
                ? newParams.delete(name)
                : newParams.set(name, bucket.bucket.toString());

              setQuery(Object.fromEntries(newParams.entries()), {
                replace: true,
                preventScrollReset: true,
              });
            }}
            customCss={{
              padding: 0,
              overflow: 'hidden',
              alignItems: 'center',
            }}
          >
            {/* Color bar */}
            <div
              css={{
                width: 8,
                height: 32,
                backgroundColor:
                  bucket.bucket === -1
                    ? '#7e7e7e'
                    : getColor((bucket.bucket - 1) * 10),
                opacity: percent > 0 ? 1 : 0.2,
                marginRight: 12,
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
                flexShrink: 0,
              }}
            />
            {/* Label and count */}
            <div
              css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '8px 12px',
              }}
            >
              <Typography whiteSpace="nowrap" color="inherit">
                {bucket.label}
              </Typography>
              <Typography whiteSpace="nowrap" color="inherit">
                {bucket.count}
              </Typography>
            </div>
          </FilterButton>
        );
      })}
    </Stack>
  );
};

const initialBuckets = [
  { bucket: 11, label: '10', count: 0 },
  { bucket: 10, label: '9.x', count: 0 },
  { bucket: 9, label: '8.x', count: 0 },
  { bucket: 8, label: '7.x', count: 0 },
  { bucket: 7, label: '6.x', count: 0 },
  { bucket: 6, label: '5.x', count: 0 },
  { bucket: 5, label: '4.x', count: 0 },
  { bucket: 4, label: '3.x', count: 0 },
  { bucket: 3, label: '2.x', count: 0 },
  { bucket: 2, label: '1.x', count: 0 },
  { bucket: 1, label: '0.x', count: 0 },
  { bucket: -1, label: 'NR', count: 0 },
];
type RatingBucket = { bucket: number; label: string; count: number };

const isYearAllowed = (year: number, filters?: IUserCollectionViewFilters) => {
  if (!filters?.year) return true;
  if (filters.year === YearFilterEnum.is) {
    return filters.yearIs ? year === Number(filters.yearIs) : true;
  }
  if (filters.year === YearFilterEnum.isafter) {
    return filters.yearStart ? year > Number(filters.yearStart) : true;
  }
  if (filters.year === YearFilterEnum.isbefore) {
    return filters.yearEnd ? year < Number(filters.yearEnd) : true;
  }
  if (filters.year === YearFilterEnum.inrange) {
    const startOk = filters.yearStart
      ? year >= Number(filters.yearStart)
      : true;
    const endOk = filters.yearEnd ? year <= Number(filters.yearEnd) : true;
    return startOk && endOk;
  }
  return true;
};

const isRatingAllowed = (
  rating: number | null,
  filters?: IUserCollectionViewFilters,
) => {
  if (!filters?.rating) return true;
  if (filters.rating === RatingFilterEnum.hasavalue) {
    return rating !== null;
  }
  if (filters.rating === RatingFilterEnum.hasnovalue) {
    return rating === null;
  }
  if (rating === null) return false;
  if (filters.rating === RatingFilterEnum.is) {
    return filters.ratingIs !== undefined ? rating === filters.ratingIs : true;
  }
  if (filters.rating === RatingFilterEnum.isgreaterthan) {
    return filters.ratingStart !== undefined
      ? rating > filters.ratingStart
      : true;
  }
  if (filters.rating === RatingFilterEnum.islessthan) {
    return filters.ratingEnd !== undefined ? rating < filters.ratingEnd : true;
  }
  if (filters.rating === RatingFilterEnum.inrange) {
    const startOk =
      filters.ratingStart !== undefined ? rating >= filters.ratingStart : true;
    const endOk =
      filters.ratingEnd !== undefined ? rating <= filters.ratingEnd : true;
    return startOk && endOk;
  }
  return true;
};

const isRatingBucketAllowed = (
  bucket: number,
  filters?: IUserCollectionViewFilters,
) => {
  if (!filters?.rating) return true;
  if (bucket === -1) {
    return isRatingAllowed(null, filters);
  }
  if (bucket === 11) {
    return isRatingAllowed(100, filters);
  }
  const start = (bucket - 1) * 10;
  const end = start + 9;
  for (let r = start; r <= end; r++) {
    if (isRatingAllowed(r, filters)) {
      return true;
    }
  }
  return false;
};

const MusicByRating = ({
  userId,
  ratingsCount,
  collectionView,
}: {
  userId: string;
  ratingsCount: number;
  collectionView?: IUserCollectionView;
}) => {
  const { data } = useQuery(
    cacheKeys.userRatingBucketsKey(userId, collectionView?.id),
    () => api.getUserRatingBuckets(userId, collectionView?.id),
  );
  const [buckets, setBuckets] = useState<RatingBucket[]>(initialBuckets);

  useEffect(() => {
    if (data) {
      setBuckets(
        initialBuckets.map((d) => ({
          ...d,
          count: data.find((v) => v.bucket === d.bucket)?.count || 0,
        })),
      );
    }
  }, [data]);

  const filteredBuckets = useMemo(() => {
    return buckets.filter((b) =>
      isRatingBucketAllowed(b.bucket, collectionView?.filters),
    );
  }, [buckets, collectionView]);

  const totalCount = useMemo(() => {
    if (collectionView) {
      return filteredBuckets.reduce((acc, curr) => acc + curr.count, 0);
    }
    return ratingsCount;
  }, [filteredBuckets, collectionView, ratingsCount]);

  return (
    <FilterByRating
      buckets={filteredBuckets}
      name="bucket"
      allRatingsCount={totalCount}
    />
  );
};

const SORT_BY_OPTIONS = [
  { label: 'Release Date', value: EntriesSortByEnum.ReleaseDate },
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
];

const UserMusicFilters = ({
  userId,
  ratingsCount,
  collectionView,
}: {
  userId: string;
  ratingsCount: number;
  collectionView?: IUserCollectionView;
}) => {
  const { sortBy, handleChange } = useSortBy();
  const [query, setQuery] = useSearchParams();

  const [tagsOpened, setTagsOpened] = useState(false);

  const hasTagsFilter = query.getAll('tags').length > 0;

  const { data: tagsData, isLoading: isTagsLoading } = useQuery(
    cacheKeys.userTagsKey(userId),
    () => api.getUserTags(userId),
    { enabled: hasTagsFilter || tagsOpened },
  );

  const tagsOptions = useMemo(() => {
    if (!tagsData) return [];

    let result = tagsData;
    if (
      collectionView?.filters.tag &&
      collectionView.filters.tagValues?.length
    ) {
      if (collectionView.filters.tag === MultiValueFilterEnum.isanyof) {
        result = tagsData.filter((t) =>
          collectionView.filters.tagValues!.includes(t.id),
        );
      } else {
        result = tagsData.filter(
          (t) => !collectionView.filters.tagValues!.includes(t.id),
        );
      }
    }

    return result.map((t) => ({
      label: `${t.tag} (${t.count})`,
      value: t.id,
    }));
  }, [tagsData, collectionView]);

  const releaseTypeOptions = useMemo(() => {
    if (
      collectionView?.filters.type &&
      collectionView.filters.typeValues?.length
    ) {
      if (collectionView.filters.type === MultiValueFilterEnum.isanyof)
        return ReleaseTypeOptions2.filter((o) =>
          collectionView.filters.typeValues.includes(o.value),
        );
      else
        return ReleaseTypeOptions2.filter(
          (o) => !collectionView.filters.typeValues.includes(o.value),
        );
    }
    return ReleaseTypeOptions2;
  }, [collectionView]);

  const currentYear = dayjs().year();

  const currentDecade = Math.floor(currentYear / 10) * 10;

  const startingYear = 1877;

  const startingDecade = Math.ceil(startingYear / 10) * 10;

  const decadeOptions = useMemo((): { label: string; value: string }[] => {
    const options = [];

    for (let decade = startingDecade; decade <= currentDecade; decade += 10) {
      let isDecadeAllowed = false;
      for (let y = decade; y < decade + 10; y++) {
        if (
          y >= startingYear &&
          y <= currentYear &&
          isYearAllowed(y, collectionView?.filters)
        ) {
          isDecadeAllowed = true;
          break;
        }
      }

      if (isDecadeAllowed) {
        options.push({
          value: decade.toString(),
          label: `${decade}s`,
        });
      }
    }

    return options.reverse();
  }, [
    currentDecade,
    startingDecade,
    currentYear,
    startingYear,
    collectionView,
  ]);

  const yearOptions = useMemo(() => {
    const selectedDecade = query.get('decade');
    if (!selectedDecade) return [];

    const startYear = Number(selectedDecade);

    const options = [];

    for (let i = 0; i < 10; i++) {
      const year = startYear + i;

      if (year > currentYear) break;

      if (year < startingYear) continue;

      if (isYearAllowed(year, collectionView?.filters)) {
        options.push({
          value: year.toString(),
          label: year.toString(),
        });
      }
    }

    return options.reverse();
  }, [query.get('decade'), collectionView, currentYear, startingYear]);

  return (
    <StickyContainer width={SM_SIDECONTENT_WIDTH}>
      <Stack gap="md">
        {Array.from(query.keys()).filter((key) => key !== 'view').length ? (
          <button
            onClick={() => {
              const params = new URLSearchParams(query);
              // clear out all params except 'view' param
              Array.from(query.keys())
                .filter((key) => key !== 'view')
                .forEach((key) => params.delete(key));
              setQuery(params, { replace: true, preventScrollReset: true });
            }}
            css={(theme) => ({
              padding: '8px 12px',
              border: 'none',
              borderRadius: theme.border_radius.base,
              backgroundColor: theme.colors.background_sub,
              color: theme.colors.text,
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: theme.colors.text,
                color: theme.colors.background,
              },
              '&:active': {
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
              },
            })}
          >
            Reset
          </button>
        ) : null}
        <Select
          onChange={(selected: SelectOption) => {
            if (selected) {
              handleChange({ value: selected.value as EntriesSortByEnum });
            }
          }}
          name="sb"
          options={SORT_BY_OPTIONS}
          value={SORT_BY_OPTIONS.find((o) => o.value === sortBy) || null}
          icon={<IconSortDescending size={20} />}
        />
        <Select
          isMulti
          options={releaseTypeOptions}
          onChange={(selected) => {
            const params = new URLSearchParams(query);
            params.delete('types');
            if (selected && Array.isArray(selected)) {
              selected.forEach((option) => {
                if (option.value !== undefined) {
                  params.append('types', option.value.toString());
                }
              });
            }
            setQuery(params, { replace: true, preventScrollReset: true });
          }}
          name="types"
          placeholder="Type"
          value={releaseTypeOptions.filter((option) =>
            query.getAll('types').map(Number).includes(option.value),
          )}
          icon={<IconDisc size={20} />}
        />
        <Select
          isClearable
          isSearchable
          options={decadeOptions}
          onChange={(selected: SelectOption) => {
            const params = new URLSearchParams(query);
            if (selected && selected.value !== undefined) {
              params.set('decade', selected.value);
            } else {
              params.delete('decade');
            }
            params.delete('year');
            setQuery(params, { replace: true, preventScrollReset: true });
          }}
          name="decade"
          placeholder="Decade"
          value={
            query.get('decade')
              ? decadeOptions.find(
                  (decade) => decade.value === query.get('decade'),
                )
              : null
          }
          icon={<IconCalendarTime size={20} />}
        />
        {query.get('decade') && (
          <Select
            isClearable
            isSearchable
            options={yearOptions}
            onChange={(selected: SelectOption) => {
              const params = new URLSearchParams(query);
              if (selected && selected.value !== undefined) {
                params.set('year', selected.value);
              } else {
                params.delete('year');
              }
              setQuery(params, { replace: true, preventScrollReset: true });
            }}
            name="year"
            placeholder="Year"
            value={yearOptions.find((year) => year.value === query.get('year'))}
            icon={<IconCalendarTime size={20} />}
          />
        )}
        <SelectGenres
          isMulti
          value={query.getAll('genres')}
          onChange={(selected) => {
            const params = new URLSearchParams(query);
            params.delete('genres');
            if (selected && Array.isArray(selected))
              selected.forEach(
                (value) => value && params.append('genres', value),
              );
            setQuery(params, { replace: true, preventScrollReset: true });
          }}
          placeholder="Genre"
          icon={<IconMusic size={20} />}
          filter={
            collectionView?.filters.genre &&
            collectionView.filters.genreValues?.length
              ? (genreId) => {
                  const isIncluded =
                    collectionView.filters.genreValues!.includes(genreId);
                  return collectionView.filters.genre ===
                    MultiValueFilterEnum.isanyof
                    ? isIncluded
                    : !isIncluded;
                }
              : undefined
          }
        />
        <SelectArtist
          isMulti
          value={query.getAll('artists')}
          onChange={(selected) => {
            const params = new URLSearchParams(query);
            params.delete('artists');
            if (selected && Array.isArray(selected))
              selected.forEach(
                (value) => value && params.append('artists', value),
              );
            setQuery(params, { replace: true, preventScrollReset: true });
          }}
          name="artists"
          placeholder="Artist"
          icon={<IconUser size={20} />}
          filterCondition={
            collectionView?.filters.artist &&
            collectionView.filters.artistValues?.length
              ? (artist) => {
                  const isIncluded =
                    collectionView.filters.artistValues!.includes(artist.id);
                  return collectionView.filters.artist ===
                    MultiValueFilterEnum.isanyof
                    ? isIncluded
                    : !isIncluded;
                }
              : undefined
          }
        />
        <SelectLabel
          isMulti
          value={query.getAll('labels')}
          onChange={(selected) => {
            const params = new URLSearchParams(query);
            params.delete('labels');
            if (selected && Array.isArray(selected))
              selected.forEach(
                (value) => value && params.append('labels', value),
              );
            setQuery(params, { replace: true, preventScrollReset: true });
          }}
          name="labels"
          placeholder="Label"
          icon={<IconBuilding size={20} />}
          filterCondition={
            collectionView?.filters.label &&
            collectionView.filters.labelValues?.length
              ? (label) => {
                  const isIncluded =
                    collectionView.filters.labelValues!.includes(label.id);
                  return collectionView.filters.label ===
                    MultiValueFilterEnum.isanyof
                    ? isIncluded
                    : !isIncluded;
                }
              : undefined
          }
        />
        <Select
          isMulti
          isSearchable
          options={tagsOptions}
          onMenuOpen={() => setTagsOpened(true)}
          onChange={(selected) => {
            const params = new URLSearchParams(query);
            params.delete('tags');
            if (selected && Array.isArray(selected)) {
              selected.forEach((option) => {
                if (option.value !== undefined) {
                  params.append('tags', option.value.toString());
                }
              });
            }
            setQuery(params, { replace: true, preventScrollReset: true });
          }}
          name="tags"
          placeholder="Tag"
          value={tagsOptions.filter((option) =>
            query.getAll('tags').includes(option.value),
          )}
          icon={<IconTags size={20} />}
        />
        <div>
          <MusicByRating
            userId={userId}
            ratingsCount={ratingsCount}
            collectionView={collectionView}
          />
        </div>
      </Stack>
    </StickyContainer>
  );
};

export default UserMusicFilters;
