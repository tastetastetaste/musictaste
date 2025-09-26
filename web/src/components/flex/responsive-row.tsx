import React from 'react';
import { BreakPointKeyT, mediaQueryMinWidth } from '../../hooks/useMediaQuery';

interface ResponsiveRowProps {
  breakpoint?: BreakPointKeyT;
  children?: any;
  reversed?: boolean;
  gap?: number | 'sm' | 'md' | 'lg';
}

export const ResponsiveRow: React.FC<ResponsiveRowProps> = ({
  breakpoint,
  children,
  reversed,
  gap,
}) => {
  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        flexDirection: reversed ? 'column-reverse' : 'column',
        gap:
          gap === 'sm'
            ? '4px'
            : gap === 'md'
              ? '8px'
              : gap === 'lg'
                ? '16px'
                : gap,
        [mediaQueryMinWidth[breakpoint]]: {
          flexDirection: 'row',
        },
      }}
    >
      {children}
    </div>
  );
};
