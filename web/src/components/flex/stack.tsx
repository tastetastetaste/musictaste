interface StackProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'apart';
  gap?: number | 'sm' | 'md' | 'lg';
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
            ? '4px'
            : gap === 'md'
              ? '8px'
              : gap === 'lg'
                ? '16px'
                : gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        height: justify === 'apart' ? '100%' : undefined,
      }}
    >
      {children}
    </div>
  );
};
