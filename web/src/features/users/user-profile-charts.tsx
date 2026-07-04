import { useQuery } from '@tanstack/react-query';
import { Chart } from '../../components/charts/chart';
import { Group } from '../../components/flex/group';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { FlexChild } from '../../components/flex/flex-child';
import { Typography } from '../../components/typography';
import { Button } from '../../components/button';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { useOutletContext } from 'react-router-dom';
import { UserPageOutletContext } from './user-page-wrapper';
import { useEffect, useState } from 'react';

const initialData = [
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

export const UserRatingsChart: React.FC<{
  userId: string;
  username: string;
  collectionViewId?: string;
}> = ({ userId, username, collectionViewId }) => {
  const { data } = useQuery(
    cacheKeys.userRatingBucketsKey(userId, collectionViewId),
    () => api.getUserRatingBuckets(userId, collectionViewId),
  );

  const ChartData = data
    ? initialData.map((d) => ({
        title: d.label,
        value: data.find((mr) => mr.bucket === d.bucket)?.count || 0,
        link: `/${username}/music?view=${collectionViewId}&bucket=${d.bucket}`,
      }))
    : null;

  return (
    <Group justify="center">
      <div css={{ width: '100%' }}>
        {ChartData && <Chart data={ChartData} yAxisWidth={40} />}
      </div>
    </Group>
  );
};
export const UserGenresChart: React.FC<{
  userId: string;
  username: string;
  collectionViewId?: string;
}> = ({ userId, username, collectionViewId }) => {
  const { data } = useQuery(
    cacheKeys.userGenresKey(userId, collectionViewId),
    () => api.getUserGenres(userId, collectionViewId),
  );

  const numberOfGenres = 20;

  return (
    <Group justify="center">
      <div css={{ width: '100%' }}>
        {data && (
          <Chart
            data={data.slice(0, numberOfGenres).map((g, i) => ({
              title: g.name,
              value: g.count,
              link: `/${username}/music?view=${collectionViewId}&genres=${g.id}`,
            }))}
            yAxisWidth={150}
          />
        )}
      </div>
    </Group>
  );
};

export const UserProfileCharts = () => {
  const { user, collectionViews, stats } =
    useOutletContext<UserPageOutletContext>();

  const [selectedViewId, setSelectedViewId] = useState<string | undefined>(
    collectionViews && collectionViews.length > 0
      ? collectionViews[0].id
      : undefined,
  );

  useEffect(() => {
    if (
      collectionViews &&
      collectionViews.length > 0 &&
      selectedViewId === undefined
    ) {
      setSelectedViewId(collectionViews[0].id);
    }
  }, [collectionViews]);

  const handleViewClick = (id: string) => {
    if (selectedViewId === id) {
      setSelectedViewId(undefined);
    } else {
      setSelectedViewId(id);
    }
  };

  const hasRatings = +stats.ratingsCount,
    hasGenres = +stats.entriesCount;

  return (
    <>
      {hasRatings || hasGenres ? (
        <FlexChild grow shrink>
          <Group justify="apart">
            {(hasRatings || hasGenres) && (
              <div
                css={{
                  minWidth: '112px',
                }}
              >
                <Typography size="title-lg">Ratings & Genres</Typography>
              </div>
            )}
            <Group justify="end" gap="sm" wrap>
              {collectionViews && collectionViews.length > 0
                ? collectionViews.map((cv) => (
                    <Button
                      key={cv.id}
                      variant={
                        selectedViewId === cv.id ? 'highlight' : undefined
                      }
                      onClick={() => handleViewClick(cv.id)}
                    >
                      {cv.title}
                    </Button>
                  ))
                : null}
            </Group>
          </Group>
          <ResponsiveRow breakpoint="sm">
            <FlexChild grow shrink>
              <UserRatingsChart
                userId={user.id}
                username={user.username}
                collectionViewId={selectedViewId}
              />
            </FlexChild>
            <FlexChild grow shrink>
              <UserGenresChart
                userId={user.id}
                username={user.username}
                collectionViewId={selectedViewId}
              />
            </FlexChild>
          </ResponsiveRow>
        </FlexChild>
      ) : null}
    </>
  );
};
