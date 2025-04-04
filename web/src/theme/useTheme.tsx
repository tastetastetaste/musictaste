import { Fragment, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  css,
  Global,
  Theme,
  ThemeProvider as TP,
  useTheme,
} from '@emotion/react';
import { Helmet } from 'react-helmet';

export const colorThemes: Record<string, Theme['colors']> = {
  'theme 1': {
    base: '#303030',
    complement: '#383838',
    main: '#696969',
    accent: '#ff8800',
    text: '#d1ccc5',
    text_sub: '#d1ccc580',
    error: '#ff5f5f',
  },
  'theme 2': {
    base: '#191919',
    complement: '#1c1c1c',
    main: '#ffa6d6',
    accent: '#d40068',
    text: '#ffffff',
    text_sub: '#ffffff80',
    error: '#FFD166',
  },
  'theme 3': {
    base: '#000000',
    complement: '#111111',
    main: '#727272',
    accent: '#00ff00',
    text: '#ffffff',
    text_sub: '#ffffff80',
    error: '#ff0000',
  },

  'theme 4': {
    base: '#f1f1f1',
    complement: '#dddddd',
    main: '#000000',
    accent: '#05a081',
    text: '#333333',
    text_sub: '#33333380',
    error: '#ff5f5f',
  },
  'theme 5': {
    base: '#212b2b',
    complement: '#244d3f',
    main: '#3e7a65',
    accent: '#f2495b',
    text: '#cdc6bc',
    text_sub: '#cdc6bc80',
    error: '#ff0000',
  },
  'theme 6': {
    base: '#f5fffa',
    complement: '#D6FFEB',
    main: '#3cb371',
    accent: '#20b2aa',
    text: '#333333',
    text_sub: '#33333380',
    error: '#ff5f5f',
  },
  red: {
    base: '#250000',
    complement: '#660000',
    main: '#b50505',
    accent: '#ff0000',
    text: '#ffffff',
    text_sub: '#ffffff80',
    error: '#ff0000',
  },
  blue: {
    base: '#001425',
    complement: '#003366',
    main: '#0560b5',
    accent: '#0080ff',
    text: '#ffffff',
    text_sub: '#ffffff80',
    error: '#ff0000',
  },
  'purple light': {
    base: '#f3e5f5',
    complement: '#e1bee7',
    main: '#f48fb1',
    accent: '#ce93d8',
    text: '#200025',
    text_sub: '#20002580',
    error: '#ff0000',
  },
  'pink light': {
    base: '#fce4ec',
    complement: '#f8bbd0',
    main: '#ff80ab',
    accent: '#f06292',
    text: '#250013',
    text_sub: '#25001380',
    error: '#ff0000',
  },
};

export const themeOptions = Object.keys(colorThemes);

const commonTheme: Omit<Theme, 'colors'> = {
  border_radius: {
    base: '4px',
  },
  font: {
    family: {
      base: "'PT Sans', sans-serif",
      sub: "'PT Sans', sans-serif",
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

const getTheme = (mode: string): Theme => {
  return {
    ...commonTheme,
    colors: colorThemes[mode] || colorThemes[themeOptions[0]],
  };
};

export const useThemeSwitcher = () => {
  const [selectedTheme, setSelectedTheme] = useLocalStorage<string>(
    'theme',
    themeOptions[0],
  );
  const [theme, setTheme] = useState(getTheme(selectedTheme));

  const switchTheme = (newTheme: string) => {
    setTheme(getTheme(newTheme));
    setSelectedTheme(newTheme);
  };

  useEffect(() => {
    setTheme(getTheme(selectedTheme));
  }, [selectedTheme]);

  return { theme, switchTheme, selectedTheme };
};

const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <Fragment>
      <Helmet>
        <meta name="theme-color" content={theme.colors.base} />
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
            background: ${theme.colors.base};

            color: ${theme.colors.text};
            width: 100%;

            overflow-x: hidden;
            overflow-y: scroll;
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
            background-color: ${theme.colors.base};
          }

          ::-webkit-scrollbar-thumb {
            background-color: ${theme.colors.complement};
            border-radius: 0;

            &:hover {
              background-color: ${theme.colors.main};
            }
            &:active {
              background-color: ${theme.colors.accent};
            }
          }

          ::selection {
            color: ${theme.colors.base};
            background: ${theme.colors.accent};
          }
        `}
      />
    </Fragment>
  );
};

export const ThemeProvider = ({ children }: { children: any }) => {
  const { theme } = useThemeSwitcher();

  return (
    <TP theme={theme}>
      <GlobalStyles />
      {children}
    </TP>
  );
};
