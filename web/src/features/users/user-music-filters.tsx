import { useTheme } from '@emotion/react';
import { IconDisc, IconFilter, IconSortDescending } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { EntriesSortByEnum, ReleaseType } from 'shared';
import { Dropdown } from '../../components/dropdown';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useRatingColor } from '../ratings/useRatingColor';
import { useSortBy } from './user-music-page';

type Option = { label: string; value: string; count: number };

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
            : theme.colors.complement,
          borderRadius: theme.border_radius.base,
          color: selected ? theme.colors.base : theme.colors.text,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.colors.text,
            color: theme.colors.base,
          },
          '&:active': {
            backgroundColor: theme.colors.main,
            color: theme.colors.base,
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

const Filter: React.FC<{
  name: string;
  options?: Option[] | null;
}> = ({ name, options }) => {
  const [query, setQuery] = useSearchParams();
  return (
    <Stack gap="sm" align="stretch">
      {options?.map((o) => (
        <FilterButton
          key={o.value}
          selected={query.get(name) === o.value}
          onClick={() =>
            setQuery(
              { ...Object.fromEntries(query.entries()), [name]: o.value },
              { replace: true, preventScrollReset: true },
            )
          }
        >
          <Typography whiteSpace="nowrap" color="inherit">
            {o.label}
          </Typography>
          <Typography whiteSpace="nowrap" color="inherit">
            {o.count}
          </Typography>
        </FilterButton>
      ))}
    </Stack>
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
            onClick={() =>
              setQuery(
                {
                  ...Object.fromEntries(query.entries()),
                  [name]: bucket.bucket.toString(),
                },
                { replace: true, preventScrollReset: true },
              )
            }
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

const FilterByDate: React.FC<{
  decades?: Decade[] | null;
}> = ({ decades }) => {
  const [query, setQuery] = useSearchParams();
  const selectedDecade = query.get('decade');
  const selectedYear = query.get('year');

  return (
    <Stack gap="sm" align="stretch">
      {decades?.map(({ decade, count, years }) => (
        <Fragment key={decade}>
          <FilterButton
            selected={selectedDecade === decade.toString() && !selectedYear}
            onClick={() =>
              setQuery(
                (() => {
                  const params = { ...Object.fromEntries(query.entries()) };
                  delete params.year;
                  return { ...params, decade: decade.toString() };
                })(),
                { preventScrollReset: true, replace: true },
              )
            }
          >
            <Typography whiteSpace="nowrap" color="inherit">
              {decade + '0s'}
            </Typography>
            <Typography whiteSpace="nowrap" color="inherit">
              {count}
            </Typography>
          </FilterButton>
          {years.map(({ year, count }) => (
            <FilterButton
              key={year}
              selected={selectedYear === year.toString()}
              onClick={() =>
                setQuery(
                  (() => {
                    const params = { ...Object.fromEntries(query.entries()) };
                    delete params.decade;
                    return { ...params, year: year.toString() };
                  })(),
                  { preventScrollReset: true, replace: true },
                )
              }
              customCss={{
                width: 'calc(100% - 20px)',
                marginLeft: 20,
              }}
            >
              <Typography whiteSpace="nowrap" color="inherit">
                {year}
              </Typography>
              <Typography whiteSpace="nowrap" color="inherit">
                {count}
              </Typography>
            </FilterButton>
          ))}
        </Fragment>
      ))}
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
type Decade = {
  decade: number;
  count: number;
  years: { year: number; count: number }[];
};

const MusicByReleaseDate = ({ userId }: { userId: string }) => {
  const { data } = useQuery(cacheKeys.userReleaseDatesKey(userId), () =>
    api.getUserReleaseDates(userId),
  );
  const [decades, setDecades] = useState<Decade[] | null>(null);

  useEffect(() => {
    if (data?.length) {
      const decadesArr: Decade[] = [];
      data.forEach(({ decade, year, count }) => {
        const existingDecade = decadesArr.find((d) => d.decade === decade);
        if (existingDecade) {
          existingDecade.count += count;
          existingDecade.years.push({ year, count });
        } else {
          decadesArr.push({ decade, count, years: [{ year, count }] });
        }
      });
      setDecades(decadesArr);
    }
  }, [data]);

  return <FilterByDate decades={decades} />;
};

const MusicByArtist = ({ userId }: { userId: string }) => {
  const { data } = useQuery(cacheKeys.userArtistsKey(userId), () =>
    api.getUserArtists(userId),
  );

  return (
    <Filter
      name="artist"
      options={data?.map((a) => ({
        label: a.name,
        value: a.id,
        count: a.count,
      }))}
    />
  );
};

const MusicByLabel = ({ userId }: { userId: string }) => {
  const { data } = useQuery(cacheKeys.userLabelsKey(userId), () =>
    api.getUserLabels(userId),
  );

  return (
    <Filter
      name="label"
      options={data?.map((l) => ({
        label: l.name,
        value: l.id,
        count: l.count,
      }))}
    />
  );
};

const MusicByGenre = ({ userId }: { userId: string }) => {
  const { data } = useQuery(cacheKeys.userGenresKey(userId), () =>
    api.getUserGenres(userId),
  );

  return (
    <Filter
      name="genre"
      options={data?.map((g) => ({
        label: g.name,
        value: g.id,
        count: g.count,
      }))}
    />
  );
};

const MusicByTag = ({ userId }: { userId: string }) => {
  const { data } = useQuery(cacheKeys.userTagsKey(userId), () =>
    api.getUserTags(userId),
  );

  return (
    <Filter
      name="tag"
      options={data?.map((t) => ({
        label: t.tag,
        value: t.id,
        count: t.count,
      }))}
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

const RELEASE_TYPE_OPTIONS = [
  { label: 'All Types', value: undefined },
  ...Object.entries(ReleaseType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      label: key,
      value: value.toString(),
    })),
];

const FILTER_TYPES = [
  { label: 'Rating', value: 'rating' },
  { label: 'Genre', value: 'genre' },
  { label: 'Tag', value: 'tag' },
  { label: 'Artist', value: 'artist' },
  { label: 'Label', value: 'label' },
  { label: 'Date', value: 'date' },
];

const FilterComponentMap = {
  rating: MusicByRating,
  genre: MusicByGenre,
  tag: MusicByTag,
  artist: MusicByArtist,
  label: MusicByLabel,
  date: MusicByReleaseDate,
};

const UserMusicFilters = ({
  userId,
  ratingsCount,
}: {
  userId: string;
  ratingsCount: number;
}) => {
  const { sortBy, handleChange } = useSortBy();
  const [filterType, setFilterType] = useState('rating');
  const FilterComponent = FilterComponentMap[filterType];
  const [query, setQuery] = useSearchParams();

  return (
    <aside
      css={{
        width: 280,
        maxWidth: '100%',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto',
        padding: '4px',
        position: 'sticky',
        top: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
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
              backgroundColor: theme.colors.complement,
              color: theme.colors.text,
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: theme.colors.text,
                color: theme.colors.base,
              },
              '&:active': {
                backgroundColor: theme.colors.main,
                color: theme.colors.base,
              },
            })}
          >
            Reset
          </button>
        )}
        <Dropdown
          options={RELEASE_TYPE_OPTIONS}
          onChange={({ value }) => {
            setQuery(
              value === undefined
                ? (() => {
                    const params = { ...Object.fromEntries(query.entries()) };
                    delete params.type;
                    return params;
                  })()
                : { ...Object.fromEntries(query.entries()), type: value },
              { replace: true, preventScrollReset: true },
            );
          }}
          name="type"
          defaultValue={query.get('type') || undefined}
          icon={<IconDisc size={20} />}
        />
        <Dropdown
          onChange={({ value }) =>
            handleChange({ value: value as EntriesSortByEnum })
          }
          name="sb"
          options={SORT_BY_OPTIONS}
          defaultValue={sortBy}
          icon={<IconSortDescending size={20} />}
        />
        <Dropdown
          onChange={({ value }) => setFilterType(value)}
          name="filterType"
          options={FILTER_TYPES}
          defaultValue={filterType}
          icon={<IconFilter size={20} />}
        />
      </Stack>
      <div>
        {FilterComponent && (
          <FilterComponent userId={userId} ratingsCount={ratingsCount} />
        )}
      </div>
    </aside>
  );
};

export default UserMusicFilters;
