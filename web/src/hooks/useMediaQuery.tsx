import { useState, useEffect } from 'react';

export type BreakPointKeyT = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

export const useMediaQuery = ({
  up,
  down,
}: {
  up?: BreakPointKeyT;
  down?: BreakPointKeyT;
}) => {
  const query = up
    ? `(min-width: ${breakpoints[up]}px)`
    : down
      ? `(max-width: ${breakpoints[down]}px)`
      : '';

  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    const listener = () => setMatches(!!matchMedia.matches);

    listener();

    // Listen matchMedia
    matchMedia.addEventListener('change', listener);

    return () => {
      matchMedia.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

export const mediaQueryMinWidth = Object.keys(breakpoints)
  .filter((key) => key !== 'xs') // Exclude 'xs' since it doesn't have a min-width.
  .reduce(
    (acc, key) => {
      acc[key as BreakPointKeyT] =
        `@media (min-width: ${breakpoints[key as BreakPointKeyT]}px)`;
      return acc;
    },
    {} as Record<BreakPointKeyT, string>,
  );
