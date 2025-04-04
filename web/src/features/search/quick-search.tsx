import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { QuickSearchResult } from './quick-search-result';
import { SearchInput } from './search-input';

const StyledSearch = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

export const QuickSearch = () => {
  const inputRef = useRef<any>();
  const containerRef = useRef<any>();
  const [value, setValue] = useState('');
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();

  useOnClickOutside(containerRef, () => setFocus(false));

  const done = () => {
    setFocus(false);
    setValue('');
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      navigate(`/search?q=${value}`);
      setFocus(false);
      setValue('');
    }
  };

  return (
    <StyledSearch ref={containerRef}>
      <SearchInput
        name="search"
        type="text"
        placeholder="Search..."
        ref={inputRef}
        onChange={(e) => setValue(e.target.value)}
        value={value}
        onKeyPress={handleKeyPress}
        onFocus={() => setFocus(true)}
      />
      <div>
        {focus && value.length !== 0 && (
          <QuickSearchResult value={value} done={done} />
        )}
      </div>
    </StyledSearch>
  );
};
