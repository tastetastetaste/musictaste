import { useEffect, useRef, useState } from 'react';

export const StickyContainer = ({
  width,
  children,
}: {
  width: number | string;
  children: React.ReactNode;
}) => {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => {
      if (ref.current) {
        setHeight(ref.current.offsetHeight);
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

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
