import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  YAxis,
  XAxis,
  Tooltip,
  Bar,
  Rectangle,
} from 'recharts';
import { useRatingColor } from '../../features/ratings/useRatingColor';

export const Chart = ({
  data,
  yAxisWidth,
}: {
  data: { title: string; value: number; link: string }[];
  yAxisWidth: number;
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const getColor = useRatingColor();

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        layout="vertical"
        responsive
        data={data.map((itm) => ({ title: itm.title, value: itm.value }))}
        margin={{
          top: 10,
        }}
      >
        <YAxis
          type="category"
          dataKey="title"
          tick={{
            fill: theme.colors.text,
            fontSize: theme.font.size.small,
            fontFamily: theme.font.family.base,
          }}
          tickLine={false}
          axisLine={{ stroke: theme.colors.background_sub }}
          width={yAxisWidth}
          interval={0} // Show all labels
        />
        <XAxis
          type="number"
          tick={{
            fill: theme.colors.text,
            fontSize: theme.font.size.small,
            fontFamily: theme.font.family.base,
          }}
          tickLine={false}
          axisLine={{ stroke: theme.colors.background_sub }}
        />

        <Tooltip
          cursor={{ fill: theme.colors.background_sub, opacity: 0.3 }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const entry = payload[0].payload;
              const percentage =
                totalValue > 0
                  ? ((entry.value / totalValue) * 100).toFixed(1)
                  : '0.0';

              return (
                <div
                  css={{
                    background: theme.colors.background_sub,
                    padding: '6px 8px',
                    borderRadius: theme.border_radius.base,
                    fontSize: theme.font.size.small,
                    color: theme.colors.text,
                  }}
                >
                  <strong>{entry.title}</strong>: {entry.value} ({percentage}%)
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          shape={(props) => (
            <Rectangle
              {...props}
              fill={getColor(((data.length - props.index) / data.length) * 100)}
              cursor="pointer"
              onClick={() => navigate(data[props.index].link)}
            />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
