import React from 'react';
import { BreakPointKeyT, mediaQueryMinWidth } from '../../hooks/useMediaQuery';

interface ResponsiveRowProps {
  breakpoint?: BreakPointKeyT;
  children?: any;
  reversed?: boolean;
}

export const ResponsiveRow: React.FC<ResponsiveRowProps> = ({
  breakpoint,
  children,
  reversed,
}) => {
  return (
    <div
      css={{
        width: '100%',
        display: 'flex',
        flexDirection: reversed ? 'column-reverse' : 'column',
        gap: '18px',
        [mediaQueryMinWidth[breakpoint]]: {
          flexDirection: 'row',
        },
      }}
    >
      {children}
    </div>
  );
};
