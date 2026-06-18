import { useTheme } from '@emotion/react';
import {
  IconBuilding,
  IconDisc,
  IconMusic,
  IconSortDescending,
  IconTags,
  IconUser,
  IconCalendarTime,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EntriesSortByEnum, ReleaseType } from 'shared';
import { StickyContainer } from '../../components/containers/sticky-container';
import { Select, SelectOption } from '../../components/inputs/select';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { SM_SIDECONTENT_WIDTH } from '../../static/spacing';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ReleaseTypeOptions } from '../contributions/shared';
import { useRatingColor } from '../ratings/useRatingColor';
import { useSortBy } from './user-music-page';
import { SelectArtist } from '../contributions/select-artist';
import { SelectLabel } from '../contributions/select-label';
import { SelectGenres } from '../genres/select-genres';
import dayjs from 'dayjs';

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

const MusicByRating = ({
  userId,
  ratingsCount,
}: {
  userId: string;
  ratingsCount: number;
}) => {
  const { data } = useQuery(cacheKeys.userRatingBucketsKey(userId), () =>
    api.getUserRatingBuckets(userId),
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

  return (
    <FilterByRating
      buckets={buckets}
      name="bucket"
      allRatingsCount={ratingsCount}
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

const RELEASE_TYPE_OPTIONS = ReleaseTypeOptions.map((option) => ({
  label: option.label,
  value: ReleaseType[option.value],
}));

const UserMusicFilters = ({
  userId,
  ratingsCount,
}: {
  userId: string;
  ratingsCount: number;
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

  const tagsOptions = tagsData
    ? tagsData.map((t) => ({
        label: `${t.tag} (${t.count})`,
        value: t.id,
      }))
    : [];

  const currentYear = dayjs().year();

  const currentDecade = Math.floor(currentYear / 10) * 10;

  const startingYear = 1877;

  const startingDecade = Math.ceil(startingYear / 10) * 10;

  const decadeOptions = useMemo((): { label: string; value: string }[] => {
    const options = [];

    for (let decade = startingDecade; decade <= currentDecade; decade += 10) {
      options.push({
        value: decade.toString(),
        label: `${decade}s`,
      });
    }

    return options.reverse();
  }, [currentDecade, startingDecade]);

  const yearOptions = useMemo(() => {
    const selectedDecade = query.get('decade');
    if (!selectedDecade) return [];

    const startYear = Number(selectedDecade);

    const options = [];

    for (let i = 0; i < 10; i++) {
      const year = startYear + i;

      if (year > currentYear) break;

      if (year < 1877) continue;

      options.push({
        value: year.toString(),
        label: year.toString(),
      });
    }

    return options.reverse();
  }, [query.get('decade')]);

  return (
    <StickyContainer width={SM_SIDECONTENT_WIDTH}>
      <Stack gap="md">
        {query.toString() && (
          <button
            onClick={() => {
              setQuery([], { replace: true, preventScrollReset: true });
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
        )}
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
          options={RELEASE_TYPE_OPTIONS}
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
          value={RELEASE_TYPE_OPTIONS.filter((option) =>
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
          <MusicByRating userId={userId} ratingsCount={ratingsCount} />
        </div>
      </Stack>
    </StickyContainer>
  );
};

export default UserMusicFilters;
