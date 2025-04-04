import { useState, useEffect, RefObject } from 'react';

export function useOnScreen(
  ref: RefObject<HTMLElement>,
  rootMargin: string = '0px',
) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIntersecting(entry.isIntersecting);
        },
        {
          rootMargin,
        },
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }
  }, [ref, rootMargin]);

  return isIntersecting;
}
