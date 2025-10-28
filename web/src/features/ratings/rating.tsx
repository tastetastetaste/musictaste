import styled from '@emotion/styled';
import { IRating } from 'shared';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Tooltip } from '../../components/popover/tooltip';
import { Typography } from '../../components/typography';
import { formatRelativeTime } from '../../utils/date-format';
import { useRatingColor } from './useRatingColor';

const StyledRatingCircle = styled.div<{ color?: string; lg?: boolean }>`
  flex: 0 0 auto;
  width: ${({ lg }) => (lg ? '80px' : '50px')};
  color: ${({ color, theme }) => color || theme.colors.text};
  svg {
    display: block;
    color: inherit;
    path {
      color: inherit;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-width: 2px;
      fill: none;
    }
  }
`;

const StyledRatingCount = styled.span`
  font-size: ${({ theme }) => theme.font.size.body};
  align-self: center;
  color: ${({ theme }) => theme.colors.text_sub};
`;

export const RatingUnderline = ({ value }: { value: number }) => {
  const getColor = useRatingColor();

  const color = getColor(value);

  return (
    <div
      css={{
        width: `${value}%`,
        background: color,
        height: 3,
      }}
    ></div>
  );
};

export const formatRatingNumber = (value: number | string) => {
  if (value === null || value === undefined || value === '') return '';

  const rating = Number(value) / 10;

  // show one decimal if the rating doesn't round to 10
  return rating.toFixed(Math.round(rating) === 10 ? 0 : 1);
};

export const RatingValue: React.FC<{ value?: number }> = ({ value }) => {
  const rated = value !== null && value !== undefined;
  const rating = rated ? formatRatingNumber(value) : null;

  return (
    <FlexChild align="flex-start" grow>
      <div
        css={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack>
          <Typography size="body-bold">{rating}</Typography>
          {rated && <RatingUnderline value={value} />}
        </Stack>
      </div>
    </FlexChild>
  );
};

interface UserRatingProps {
  rating?: IRating | null;
}

export const UserRating: React.FC<UserRatingProps> = ({ rating }) => {
  const rated = rating?.rating !== null && rating?.rating !== undefined;

  return rated ? (
    <Group gap="sm">
      <Tooltip content={`Rated ${formatRelativeTime(rating.updatedAt)}`}>
        <RatingValue value={rating.rating} />
      </Tooltip>
    </Group>
  ) : null;
};

export const AllUsersRating: React.FC<{
  rating: number;
  count?: number;
}> = ({ rating, count }) => {
  return (
    <Group>
      <RatingValue value={rating} />
      <StyledRatingCount>({count})</StyledRatingCount>
    </Group>
  );
};

export const RatingCircle = ({
  rating,
  count,
  lg,
}: {
  rating: number;
  count?: number;
  lg?: boolean;
}) => {
  const value = rating?.toFixed();

  const getColor = useRatingColor();

  const color = getColor(rating);

  return (
    <Stack align="center">
      <StyledRatingCircle color={value ? color : undefined} lg={lg}>
        <svg viewBox="0 0 36 36">
          <path
            strokeDasharray={`${value}, 100`}
            d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <text
            x="50%"
            y="53%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{
              color: 'inherit',
              fill: 'currentColor',
              fontWeight: '700',
            }}
          >
            {value ? formatRatingNumber(value) : 'NA'}
          </text>
        </svg>
      </StyledRatingCircle>
      {count && <StyledRatingCount>({count})</StyledRatingCount>}
    </Stack>
  );
};
