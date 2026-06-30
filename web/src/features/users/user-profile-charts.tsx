import { useQuery } from '@tanstack/react-query';
import { Chart } from '../../components/charts/chart';
import { Group } from '../../components/flex/group';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

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
}> = ({ userId, username }) => {
  const { data } = useQuery(cacheKeys.userRatingBucketsKey(userId), () =>
    api.getUserRatingBuckets(userId),
  );

  const ChartData = data
    ? initialData.map((d) => ({
        title: d.label,
        value: data.find((mr) => mr.bucket === d.bucket)?.count || 0,
        link: `/${username}/music?bucket=${d.bucket}`,
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
}> = ({ userId, username }) => {
  const { data } = useQuery(cacheKeys.userGenresKey(userId), () =>
    api.getUserGenres(userId),
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
              link: `/${username}/music?genres=${g.id}`,
            }))}
            yAxisWidth={150}
          />
        )}
      </div>
    </Group>
  );
};
