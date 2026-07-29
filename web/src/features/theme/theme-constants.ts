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
      title_xl: 'clamp(32px, 6vw, 50px)',
      title_lg: 'clamp(18px, 4vw, 24px)',
      title: 'clamp(15px, 2.5vw, 18px)',
      body: 'clamp(13px, 1.5vw, 14px)',
      small: 'clamp(10px, 1.2vw, 11px)',
    },
  },
};

export const THEME_COLOR_PRESETS = themeColors;
