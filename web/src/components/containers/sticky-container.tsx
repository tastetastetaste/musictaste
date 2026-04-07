import { useElementHeight } from '../../hooks/useElementHeight';

export const StickyContainer = ({
  width,
  children,
}: {
  width: number | string;
  children: React.ReactNode;
}) => {
  const { height, ref } = useElementHeight();

  return (
    <div
      ref={ref}
      css={{
        position: 'sticky',
        top: height ? `min(80px, calc(100vh - ${height}px - 20px))` : '80px',
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    >
      {children}
    </div>
  );
};
