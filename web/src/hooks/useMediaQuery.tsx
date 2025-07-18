import { useState, useEffect, createContext, useContext } from 'react';

const ScreenSizeContext = createContext<number>(0);

export const useScreenSize = () => useContext(ScreenSizeContext);

export const ScreenSizeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [screenSize, setScreenSize] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

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
  const screenSize = useScreenSize();

  return up ? screenSize >= breakpoints[up] : screenSize < breakpoints[down];
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
