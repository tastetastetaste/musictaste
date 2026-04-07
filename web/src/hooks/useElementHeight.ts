import { useState, useCallback, useRef } from 'react';

export const useElementHeight = () => {
  const [height, setHeight] = useState(0);

  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) {
      observer.current.disconnect();
    }

    if (node) {
      observer.current = new ResizeObserver(() => {
        setHeight(node.offsetHeight);
      });

      observer.current.observe(node);

      setHeight(node.offsetHeight);
    }
  }, []);

  return { height, ref };
};
