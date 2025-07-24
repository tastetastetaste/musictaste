import { useTheme } from '@emotion/react';
import Color from 'color';
import { useCallback } from 'react';

export const useRatingColor = () => {
  const theme = useTheme();

  const getColor = useCallback(
    (rating: number) => {
      if (rating < 0) {
        return Color(theme.colors.text).hex();
      }

      return Color(theme.colors.text)
        .mix(Color(theme.colors.highlight), rating / 100)
        .hex();
    },
    [theme],
  );

  return getColor;
};
