interface GroupProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  justify?: 'start' | 'end' | 'center' | 'apart';
  gap?: number | 'sm' | 'md' | 'lg';
  wrap?: boolean;
  overflow?: 'hidden';
}

export const Group: React.FC<GroupProps> = ({
  children,
  align,
  justify,
  gap,
  wrap,
  overflow,
}) => {
  return (
    <div
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
            ? '4px'
            : gap === 'md'
              ? '8px'
              : gap === 'lg'
                ? '16px'
                : gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        width: justify === 'apart' ? '100%' : undefined,
        overflow,
      }}
    >
      {children}
    </div>
  );
};
