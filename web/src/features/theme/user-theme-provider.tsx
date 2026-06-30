import { ThemeProvider, useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { IUserSummary } from 'shared';
import { useAuth } from '../account/useAuth';

export const UserThemeProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: IUserSummary;
}) => {
  const theme = useTheme();
  // use location state to avoid flashing while loading
  const location = useLocation();
  const { me } = useAuth();

  return (
    <ThemeProvider
      theme={{
        ...theme,
        colors:
          // user theme
          user && user.supporter && user.theme && user.id !== me?.id
            ? user.theme
            : // user theme from location state
              location.state?.user &&
                location.state.user.supporter &&
                location.state.user.theme
              ? location.state.user.theme
              : // default theme.colors
                theme.colors,
      }}
    >
      {children}
    </ThemeProvider>
  );
};
