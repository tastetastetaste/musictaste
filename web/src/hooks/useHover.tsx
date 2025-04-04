import { useRef, useState, useEffect } from 'react';

type UseHover = () => [any, boolean];

export const useHover: UseHover = () => {
  const [value, setValue] = useState(false);

  const ref = useRef<any>(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener('mouseover', handleMouseOver);
      node.addEventListener('mouseout', handleMouseOut);

      return () => {
        node.removeEventListener('mouseover', handleMouseOver);
        node.removeEventListener('mouseout', handleMouseOut);
      };
    } else return;
  }, [ref.current]);

  return [ref, value];
};
