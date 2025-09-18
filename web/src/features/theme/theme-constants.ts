import { Theme } from '@emotion/react';
import themeColors from './theme-colors.json';
export const baseTheme: Omit<Theme, 'colors'> = {
  border_radius: {
    base: '4px',
  },
  font: {
    family: {
      base: "'Open Sans', sans-serif",
      sub: "'Open Sans', sans-serif",
    },
    weight: {
      normal: 400,
      bold: 700,
      bolder: 900,
    },
    size: {
      title_xl: '50px',
      title_lg: '24px',
      title: '18px',
      body: '14px',
      small: '11px',
    },
  },
};

export const THEME_COLOR_PRESETS = themeColors;
