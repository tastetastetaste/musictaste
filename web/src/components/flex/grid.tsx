import { mediaQueryMinWidth } from '../../hooks/useMediaQuery';

interface GridProps {
  children: React.ReactNode;
  /**
   * [xs, sm, md, lg, xl]
   */
  cols: number[];
  gap?: number | string;
}

export const Grid: React.FC<GridProps> = ({ children, cols, gap = 0 }) => {
  const xs = cols[0] || 1;
  const sm = cols[1] || xs;
  const md = cols[2] || sm;
  const lg = cols[3] || md;
  const xl = cols[4] || lg;

  return (
    <div
      css={{
        padding: 0,
        margin: 0,
        width: '100%',
        display: 'grid',
        gridColumnGap: gap,
        gridRowGap: gap,
        justifyItems: 'center',

        gridTemplateColumns: `repeat(${xs}, minmax(0, 1fr))`,
        [mediaQueryMinWidth['sm']]: {
          gridTemplateColumns: `repeat(${sm}, minmax(0, 1fr))`,
        },
        [mediaQueryMinWidth['md']]: {
          gridTemplateColumns: `repeat(${md}, minmax(0, 1fr))`,
        },
        [mediaQueryMinWidth['lg']]: {
          gridTemplateColumns: `repeat(${lg}, minmax(0, 1fr))`,
        },
        [mediaQueryMinWidth['xl']]: {
          gridTemplateColumns: `repeat(${xl}, minmax(0, 1fr))`,
        },
      }}
    >
      {children}
    </div>
  );
};
