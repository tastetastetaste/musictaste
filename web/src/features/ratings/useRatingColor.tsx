import { useTheme } from '@emotion/react';
import Color from 'color';
import { useCallback } from 'react';

export const useRatingColor = () => {
  const theme = useTheme();

  const getColor = useCallback(
    (percentage: number) => {
      const baseColor = Color(theme.colors.highlight);
      const errorColor = Color(theme.colors.error);

      const baseHue = baseColor.hue();
      const baseSat = baseColor.saturationl();
      const baseLight = baseColor.lightness();

      const errorHue = errorColor.hue();
      const errorSat = errorColor.saturationl();
      const errorLight = errorColor.lightness();

      // Calculate distances
      const satDistance = errorSat - baseSat;
      const lightDistance = errorLight - baseLight;
      let hueDistance = errorHue - baseHue;

      // Take the short bath
      if (hueDistance > 180) hueDistance -= 360;
      if (hueDistance < -180) hueDistance += 360;

      // Calculate
      const factor = (100 - percentage) / 100;
      const currentSat = baseSat + factor * satDistance;
      const currentLight = baseLight + factor * lightDistance;
      const currentHue = baseHue + factor * hueDistance + 360;

      return Color.hsl(currentHue, currentSat, currentLight).hex();
    },
    [theme],
  );

  return getColor;
};
