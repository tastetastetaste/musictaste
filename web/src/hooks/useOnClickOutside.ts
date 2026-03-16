import { useEffect } from 'react';

type Ref = React.RefObject<HTMLElement>;
type Handler = (event: MouseEvent | TouchEvent) => void;

export function useOnClickOutside(ref: Ref, handler: Handler): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;

      if (!ref.current || ref.current.contains(target as Node)) {
        return;
      }

      // prevent select component from closing the dialog on dropdown click
      if (target.closest && target.closest('.react-select__menu')) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
