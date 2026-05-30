import { forwardRef } from 'react';
import { GAP_LG, GAP_MD, GAP_SM, GAP_XL } from '../../static/spacing';

interface GroupProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  justify?: 'start' | 'end' | 'center' | 'apart';
  gap?: number | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  overflow?: 'hidden';
}

export const Group = forwardRef(
  ({ children, align, justify, gap, wrap, overflow }: GroupProps, ref) => {
    return (
      <div
        ref={ref as any}
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems:
            align === 'start'
              ? 'flex-start'
              : align === 'end'
                ? 'flex-end'
                : 'center',
          justifyContent:
            justify === 'end'
              ? 'flex-end'
              : justify === 'center'
                ? 'center'
                : justify === 'apart'
                  ? 'space-between'
                  : 'flex-start',
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
          flexWrap: wrap ? 'wrap' : 'nowrap',
          width: justify === 'apart' ? '100%' : undefined,
          overflow,
        }}
      >
        {children}
      </div>
    );
  },
);
