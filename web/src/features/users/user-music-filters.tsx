import {
  IconCalendarMonth,
  IconDisc,
  IconHash,
  IconMusic,
  IconStar,
  IconTags,
} from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/button';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Popover } from '../../components/popover';
import { api } from '../../utils/api';
import { useRatingColor } from '../ratings/useRatingColor';
import { cacheKeys } from '../../utils/cache-keys';

type Option = { label: string; value: string; count: number };

const Filter: React.FC<{
  name: string;
  options?: Option[] | null;
}> = ({ name, options }) => {
  const [query, setQuery] = useSearchParams();
  return (
    <Stack gap="sm" align="start">
      {options?.map((o) => (
        <Button
          variant="text"
          // active={query.get(name) === o.value}
          key={o.value}
          onClick={() =>
            setQuery(
              { [name]: o.value },
              { replace: true, preventScrollReset: true },
            )
          }
        >
          {o.label} ({o.count})
        </Button>
      ))}
    </Stack>
  );
};

const FilterByRating: React.FC<{
  name: string;
  buckets?: RatingBucket[];
  allRatingsCount: number;
}> = ({ name, buckets, allRatingsCount }) => {
  const width100p = 230;
  const widthForOneRating = width100p / allRatingsCount;

  const [query, setQuery] = useSearchParams();

  const getColor = useRatingColor();

  return (
    <div>
      {buckets?.map((bucket) => (
        <Group gap={10} key={bucket.bucket}>
          <div
            style={{
              width: widthForOneRating * bucket.count,
              height: '26px',
              backgroundColor:
                bucket.bucket === -1
                  ? '#7e7e7e'
                  : getColor((bucket.bucket - 1) * 10),
            }}
          />
          <Button
            // active={query.get(name) === bucket.bucket.toString()}
            variant="text"
            onClick={() =>
              setQuery(
                { [name]: bucket.bucket.toString() },
                { replace: true, preventScrollReset: true },
              )
            }
          >
            {bucket.label} ({bucket.count})
          </Button>
        </Group>
      ))}
    </div>
  );
};

const FilterByDate: React.FC<{
  decades?: Decade[] | null;
}> = ({ decades }) => {
  const [query, setQuery] = useSearchParams();
  return (
    <div>
      {decades?.map(({ decade, count, years }) => (
        <Fragment key={decade}>
          <div>
            <Button
              // active={query.get('decade') === decade.toString()}
              variant="text"
              onClick={() =>
                setQuery(
                  { decade: decade.toString() },
                  { preventScrollReset: true, replace: true },
                )
              }
            >
              {decade + '0s'} ({count})
            </Button>
          </div>
          {years.map(({ year, count }) => (
            <div key={year} style={{ marginLeft: 10 }}>
              <Button
                // active={query.get('year') === year.toString()}
                variant="text"
                onClick={() =>
                  setQuery(
                    { year: year.toString() },
                    { preventScrollReset: true, replace: true },
                  )
                }
              >
                {year} ({count})
              </Button>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
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

const MusicFilterSections = [
  { label: 'ratings', component: MusicByRating, icon: IconStar },
  { label: 'date', component: MusicByReleaseDate, icon: IconCalendarMonth },
  { label: 'tags', component: MusicByTag, icon: IconTags },
  { label: 'genres', component: MusicByGenre, icon: IconHash },
  { label: 'artists', component: MusicByArtist, icon: IconMusic },
  { label: 'labels', component: MusicByLabel, icon: IconDisc },
];

const UserMusicFilters = ({
  userId,
  ratingsCount,
}: {
  userId: string;
  ratingsCount: number;
}) => {
  const [query, setQuery] = useSearchParams();
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpen = (label) => {
    setOpenPopover(label);
  };

  const handleClose = () => {
    setOpenPopover(null);
  };
  return (
    <Group gap="md" wrap>
      {query.toString() && (
        <Button
          variant="text"
          onClick={() =>
            setQuery([], { replace: true, preventScrollReset: true })
          }
        >
          (clear)
        </Button>
      )}
      {MusicFilterSections.map(
        ({ label, component: Component, icon: Icon }) => (
          <Popover
            key={label}
            content={<Component userId={userId} ratingsCount={ratingsCount} />}
            open={openPopover === label}
            onClose={handleClose}
          >
            <IconButton
              title={label}
              onClick={() =>
                openPopover === label ? handleClose() : handleOpen(label)
              }
            >
              <Icon />
            </IconButton>
          </Popover>
        ),
      )}
    </Group>
  );
};

export default UserMusicFilters;
