import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { Navigation } from '../../components/nav';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchInput } from './search-input';

export type SearchPageOutletContext = {
  q: string;
};

const SearchPageWrapper: React.FC = () => {
  const [params, setParams] = useSearchParams();

  const [q, setQ] = useState(params.get('q') || '');
  const debouncedValue = useDebounce(q, 300);

  useEffect(() => {
    if (debouncedValue) {
      setParams({ q: debouncedValue });
    } else {
      setParams({});
    }
  }, [debouncedValue, setParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  return (
    <AppPageWrapper title="Search">
      <SearchInput
        placeholder="Search..."
        value={q}
        onChange={handleInputChange}
      />
      <Navigation
        links={[
          {
            label: 'All',
            to: `/search${debouncedValue ? '?q=' + debouncedValue : ''}`,
          },
          {
            label: 'Release',
            to: `/search/release${debouncedValue ? '?q=' + debouncedValue : ''}`,
          },
          {
            label: 'Artist',
            to: `/search/artist${debouncedValue ? '?q=' + debouncedValue : ''}`,
          },
          {
            label: 'Label',
            to: `/search/label${debouncedValue ? '?q=' + debouncedValue : ''}`,
          },
          {
            label: 'Genre',
            to: `/search/genre${debouncedValue ? '?q=' + debouncedValue : ''}`,
          },
          {
            label: 'User',
            to: `/search/user${debouncedValue ? '?q=' + debouncedValue : ''}`,
          },
        ]}
      />
      {debouncedValue ? (
        <Outlet context={{ q: debouncedValue }} />
      ) : (
        <div></div>
      )}
    </AppPageWrapper>
  );
};

export default SearchPageWrapper;
