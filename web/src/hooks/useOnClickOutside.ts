import { useEffect } from 'react';

type Ref = React.RefObject<HTMLElement>;
type Handler = (event: MouseEvent | TouchEvent) => void;

export function useOnClickOutside(ref: Ref, handler: Handler): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
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
