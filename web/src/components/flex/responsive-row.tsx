import React from 'react';
import { BreakPointKeyT, mediaQueryMinWidth } from '../../hooks/useMediaQuery';
import { GAP_SM, GAP_MD, GAP_LG, GAP_XL } from '../../static/spacing';

interface ResponsiveRowProps {
  breakpoint?: BreakPointKeyT;
  children?: any;
  reversed?: boolean;
  gap?: number | 'sm' | 'md' | 'lg' | 'xl';
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
            ? GAP_SM
            : gap === 'md'
              ? GAP_MD
              : gap === 'lg'
                ? GAP_LG
                : gap === 'xl'
                  ? GAP_XL
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
