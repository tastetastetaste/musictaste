import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { mediaQueryMinWidth } from '../../hooks/useMediaQuery';
import { QuickSearchResult } from './quick-search-result';
import { SearchInput } from './search-input';

const StyledSearch = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;

  ${mediaQueryMinWidth.md} {
    width: 400px;
  }
`;

export const QuickSearch = ({
  onActiveChange,
}: {
  onActiveChange: (active: boolean) => void;
}) => {
  const inputRef = useRef<any>();
  const containerRef = useRef<any>();
  const [value, setValue] = useState('');
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();

  const debouncedValue = useDebounce(value, 300);

  useOnClickOutside(containerRef, () => {
    setFocus(false);
    onActiveChange(false);
  });

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(value)}`);
      setFocus(false);
      setValue('');
      onActiveChange(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onActiveChange(focus && newValue.length > 0);
  };

  const handleFocus = () => {
    setFocus(true);
    if (value.length > 0) {
      onActiveChange(true);
    }
  };

  return (
    <StyledSearch ref={containerRef}>
      <SearchInput
        name="search"
        type="text"
        placeholder="Search..."
        ref={inputRef}
        onChange={handleChange}
        value={value}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
      />
      <div>
        {focus && debouncedValue.length !== 0 && (
          <QuickSearchResult value={debouncedValue} />
        )}
      </div>
    </StyledSearch>
  );
};
