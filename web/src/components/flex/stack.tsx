import { GAP_SM, GAP_MD, GAP_LG, GAP_XL } from '../../static/spacing';

interface StackProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'apart';
  gap?: number | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  children,
  align,
  justify,
  gap,
  wrap,
}) => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems:
          align === 'start'
            ? 'flex-start'
            : align === 'end'
              ? 'flex-end'
              : align === 'center'
                ? 'center'
                : 'stretch',
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
        height: justify === 'apart' ? '100%' : undefined,
      }}
    >
      {children}
    </div>
  );
};
