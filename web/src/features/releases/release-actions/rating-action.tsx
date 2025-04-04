import styled from '@emotion/styled';
import { IconCheck, IconStar, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';
import { Group } from '../../../components/flex/group';
import { Stack } from '../../../components/flex/stack';
import { IconButton } from '../../../components/icon-button';
import { Popover } from '../../../components/popover';
import { formatRatingNumber, RatingUnderline } from '../../ratings/rating';
import { UserRating } from '../../ratings/rating';
import { useRatingColor } from '../../ratings/useRatingColor';
import { useReleaseActions } from './useReleaseActions';
import { useTheme } from '@emotion/react';

const StyledRatingInput = styled.input`
  padding: 0;
  margin: 0;
  border: 0;
  width: 27px;
  outline: none;
  max-width: 27px;
  height: 17px;
  max-height: 17px;
  display: block;
  background: transparent;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-color);
  font-weight: var(--fw-bold);
  &:hover,
  &:focus {
    outline: none;
  }
`;

export const RatingPopoverContent: React.FC<{
  releaseId: string;
}> = ({ releaseId }) => {
  const {
    entry,
    isEntryLoading,
    ratingAction,
    createEntryLoading,
    updateEntryLoading,
    removeEntryLoading,
  } = useReleaseActions(releaseId);

  const [isRated, setIsRated] = useState(false);

  const [rangeValue, setRangeValue] = useState<number>(0);

  const [inputValue, setInputValue] = useState<string>('');

  const isLoading =
    isEntryLoading ||
    createEntryLoading ||
    updateEntryLoading ||
    removeEntryLoading;

  useEffect(() => {
    if (entry?.rating) {
      setIsRated(true);
      setRangeValue(entry.rating.rating);
      setInputValue(formatRatingNumber(entry.rating.rating));
    }
  }, [entry]);

  const theme = useTheme();

  const getColor = useRatingColor();

  const color = getColor(rangeValue);

  const handleInputChange = (value: string) => {
    if (value === '') {
      setInputValue('');
      setRangeValue(null);
    } else {
      const numericValue = Number(value);

      // Restrict input to values between 0 and 10
      if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10) {
        setInputValue(value);
        setRangeValue(numericValue * 10);
      }
    }
  };

  const handleRangeChange = (value: number) => {
    setRangeValue(value);
    setInputValue(formatRatingNumber(value));
  };

  const handleBlur = () => {
    if (rangeValue !== null) {
      setInputValue(formatRatingNumber(rangeValue));
    }
  };

  return (
    <div
      css={{
        margin: '16px 8px',
      }}
    >
      <Stack gap="sm">
        <Range
          step={1}
          min={0}
          max={100}
          values={[rangeValue]}
          onChange={(values) => handleRangeChange(values[0])}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                backgroundColor: color,
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '20px',
                width: '20px',
                backgroundColor: theme.colors.accent,
                border: '1px solid currentColor',
              }}
            />
          )}
        />

        <Group gap="sm">
          <Stack>
            <StyledRatingInput
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleBlur}
              value={inputValue}
              placeholder="NR"
              autoComplete="off"
              type="number"
              step="0.1"
              min="0"
              max="10"
              autoFocus={true}
            />

            <RatingUnderline value={rangeValue || 0} />
          </Stack>
          <IconButton
            title="Save"
            disabled={isLoading}
            onClick={() => {
              ratingAction(rangeValue);
            }}
          >
            <IconCheck />
          </IconButton>
          {isRated && (
            <IconButton
              title="Remove"
              disabled={isLoading}
              onClick={() => {
                ratingAction();
              }}
              danger
            >
              <IconX />
            </IconButton>
          )}
        </Group>
      </Stack>
    </div>
  );
};

export const RatingAction: React.FC<{
  releaseId: string;
}> = ({ releaseId }) => {
  const { entry } = useReleaseActions(releaseId);

  const [open, setOpen] = useState(false);

  const isRated = !!entry?.rating;

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      content={<RatingPopoverContent releaseId={releaseId} />}
    >
      <IconButton
        onClick={() => setOpen(!open)}
        title="Rate"
        active={isRated}
        variant="solid"
      >
        {isRated ? <UserRating rating={entry.rating} hideDate /> : <IconStar />}
      </IconButton>
    </Popover>
  );
};
