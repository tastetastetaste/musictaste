import { Fragment, useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  css,
  Global,
  Theme,
  ThemeProvider as TP,
  useTheme,
} from '@emotion/react';
import { Helmet } from 'react-helmet';
import { baseTheme, THEME_COLOR_PRESETS } from './theme-constants';

export function useThemeColors() {
  const [themeColors, setThemeColors] = useLocalStorage<Theme['colors']>(
    'themeColors',
    THEME_COLOR_PRESETS['gray 1'],
  );
  const [selectedPreset, setSelectedPreset] = useLocalStorage<string>(
    'themePreset',
    'gray 1',
  );

  const applyPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    setThemeColors({ ...THEME_COLOR_PRESETS[presetName] });
  };

  const changeThemeColors = (colors: Theme['colors']) => {
    setThemeColors(colors);
    setSelectedPreset('custom');
  };

  return {
    themeColors,
    setThemeColors: changeThemeColors,
    applyPreset,
    selectedPreset,
  };
}

export const ThemeProvider = ({ children }: { children: any }) => {
  const { themeColors } = useThemeColors();
  const [theme, setTheme] = useState({ ...baseTheme, colors: themeColors });

  useEffect(() => {
    setTheme({ ...baseTheme, colors: themeColors });
  }, [themeColors]);

  return (
    <TP theme={theme}>
      <GlobalStyles />
      {children}
    </TP>
  );
};

const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <Fragment>
      <Helmet>
        <meta name="theme-color" content={theme.colors.background} />
      </Helmet>
      <Global
        styles={css`
          *,
          *::after,
          *::before {
            box-sizing: border-box;
          }

          * {
            margin: 0;
            padding: 0;
            border: none;
          }

          html {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          body {
            font-family: ${theme.font.family.base};
            font-size: 14px;
            font-weight: ${theme.font.weight.normal};
            font-optical-sizing: auto;
            font-style: normal;
            font-variation-settings: 'wdth' 100;

            background: ${theme.colors.background};

            color: ${theme.colors.text};
            width: 100%;

            overflow-x: hidden;
            overflow-y: scroll;

            padding-bottom: 50px;
          }

          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          /* Firefox */
          input[type='number'] {
            -moz-appearance: textfield;
          }

          /* hotkeys */
          div[tabindex='-1']:focus {
            outline: 0;
          }

          /* radio */
          input[type='radio'] {
            display: none;
          }

          /* scrollbar */

          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background-color: ${theme.colors.background};
          }

          ::-webkit-scrollbar-thumb {
            background-color: ${theme.colors.background_sub};
            border-radius: 0;

            &:hover {
              background-color: ${theme.colors.primary};
            }
            &:active {
              background-color: ${theme.colors.highlight};
            }
          }

          ::selection {
            color: ${theme.colors.background};
            background: ${theme.colors.highlight};
          }
        `}
      />
    </Fragment>
  );
};
