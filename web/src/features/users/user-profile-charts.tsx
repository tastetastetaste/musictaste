import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import { memo, useState } from 'react';
import { PieChart, pieChartDefaultProps } from 'react-minimal-pie-chart';
import { useQuery } from 'react-query';
import { Group } from '../../components/flex/group';
import { api } from '../../utils/api';
import { useRatingColor } from '../ratings/useRatingColor';
import { cacheKeys } from '../../utils/cache-keys';

const StyledText = styled.text`
  font-size: 3px;
  font-family: ${({ theme }) => theme.font.family.base};
  pointer-events: none;
`;

const Chart = memo<{
  data: { title: string; value: number; color: string }[];
}>(function ChartFu({ data }) {
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  return (
    <PieChart
      data={data.map((entry, i) => ({
        ...entry,
        color: hovered === i ? 'gray' : entry.color,
      }))}
      startAngle={-90}
      lengthAngle={-360}
      style={{
        fill: 'currentcolor',
        userSelect: 'none',
      }}
      radius={pieChartDefaultProps.radius - 15}
      segmentsShift={(index) => (index === hovered ? 2 : 1)}
      label={({ x, y, dx, dy, dataEntry, dataIndex }) => (
        <StyledText
          x={x}
          y={y}
          dx={dx}
          dy={dy}
          dominantBaseline="central"
          textAnchor="middle"
        >
          {dataIndex === hovered
            ? `${dataEntry.value} · ${
                dataEntry.title
              } · ${dataEntry.percentage.toFixed()}%`
            : typeof hovered === 'number'
              ? ''
              : dataEntry.title}
        </StyledText>
      )}
      labelPosition={100}
      onMouseOver={(_, index) => {
        setHovered(index);
      }}
      onMouseOut={() => {
        setHovered(undefined);
      }}
    />
  );
});

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

export const UserRatingsChart: React.FC<{ userId: string }> = ({ userId }) => {
  const { data } = useQuery(cacheKeys.userRatingBucketsKey(userId), () =>
    api.getUserRatingBuckets(userId),
  );

  const getColor = useRatingColor();

  const ChartData = data
    ? initialData
        .map((d) => ({
          title: d.label,
          value: data.find((mr) => mr.bucket === d.bucket)?.count || 0,
          color: getColor((d.bucket - 1) * 10),
        }))
        .filter((v) => v.value > 0)
    : null;

  return (
    <Group justify="center">{ChartData && <Chart data={ChartData} />}</Group>
  );
};
export const UserGenresChart: React.FC<{ userId: string }> = ({ userId }) => {
  const { data } = useQuery(cacheKeys.userGenresKey(userId), () =>
    api.getUserGenres(userId),
  );

  const {
    colors: { highlight: accent, primary: main, background_sub: complement },
  } = useTheme();

  const numberOfGenres = 20;

  return (
    <Group justify="center">
      {data && (
        <Chart
          data={data.slice(0, numberOfGenres).map((g, i) => ({
            title: g.name,
            value: g.count,
            color: Color(main)
              .mix(Color(complement), i / numberOfGenres)
              .hex(),
          }))}
        />
      )}
    </Group>
  );
};
