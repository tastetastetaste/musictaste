import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import Color from 'color';
import { memo, useCallback, useState } from 'react';
import { PieChart, pieChartDefaultProps } from 'react-minimal-pie-chart';
import { useNavigate } from 'react-router-dom';
import { Group } from '../../components/flex/group';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

const StyledText = styled.text`
  font-size: 3px;
  font-family: ${({ theme }) => theme.font.family.base};
  color: ${({ theme }) => theme.colors.primary};
  pointer-events: none;
`;

export const useChartColor = () => {
  const theme = useTheme();

  const getColor = useCallback(
    (percentage: number) => {
      if (percentage < 0) {
        return Color(theme.colors.background_sub).hex();
      }

      return Color(theme.colors.background_sub)
        .mix(Color(theme.colors.highlight), percentage / 100)
        .hex();
    },
    [theme],
  );

  return getColor;
};

const Chart = memo<{
  data: { title: string; value: number; color: string; link: string }[];
}>(function ChartFu({ data }) {
  const [hovered, setHovered] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  return (
    <PieChart
      data={data.map((entry, i) => ({
        ...entry,
      }))}
      startAngle={-90}
      lengthAngle={-360}
      style={{
        fill: 'currentcolor',
        userSelect: 'none',
        overflow: 'visible',
        cursor: 'pointer',
      }}
      radius={pieChartDefaultProps.radius - 5}
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
      labelPosition={85}
      onMouseOver={(_, index) => {
        setHovered(index);
      }}
      onMouseOut={() => {
        setHovered(undefined);
      }}
      onClick={(_, index) => {
        navigate(data[index].link);
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

export const UserRatingsChart: React.FC<{
  userId: string;
  username: string;
}> = ({ userId, username }) => {
  const { data } = useQuery(cacheKeys.userRatingBucketsKey(userId), () =>
    api.getUserRatingBuckets(userId),
  );

  const getColor = useChartColor();

  const ChartData = data
    ? initialData
        .map((d) => ({
          title: d.label,
          value: data.find((mr) => mr.bucket === d.bucket)?.count || 0,
          color: getColor((d.bucket - 1) * 10),
          link: `/${username}/music?bucket=${d.bucket}`,
        }))
        .filter((v) => v.value > 0)
    : null;

  return (
    <Group justify="center">{ChartData && <Chart data={ChartData} />}</Group>
  );
};
export const UserGenresChart: React.FC<{
  userId: string;
  username: string;
}> = ({ userId, username }) => {
  const { data } = useQuery(cacheKeys.userGenresKey(userId), () =>
    api.getUserGenres(userId),
  );

  const getColor = useChartColor();

  const numberOfGenres = 20;

  return (
    <Group justify="center">
      {data && (
        <Chart
          data={data.slice(0, numberOfGenres).map((g, i) => ({
            title: g.name,
            value: g.count,
            color: getColor(((numberOfGenres - 1 - i) / numberOfGenres) * 100),
            link: `/${username}/music?genre=${g.id}`,
          }))}
        />
      )}
    </Group>
  );
};
