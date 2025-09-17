import { useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { Navigation } from '../../components/nav';
import { SearchInput } from './search-input';

export type SearchPageOutletContext = {
  q: string;
};

const SearchPageWrapper: React.FC = () => {
  const [params, setParams] = useSearchParams();

  const [q, setQ] = useState(params.get('q'));

  return (
    <AppPageWrapper title="Search">
      <SearchInput
        placeholder="Search..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Navigation
        links={[
          { label: 'All', to: `/search${q ? '?q=' + q : ''}` },
          {
            label: 'Release',
            to: `/search/release${q ? '?q=' + q : ''}`,
          },
          {
            label: 'Artist',
            to: `/search/artist${q ? '?q=' + q : ''}`,
          },
          {
            label: 'Label',
            to: `/search/label${q ? '?q=' + q : ''}`,
          },
          {
            label: 'Genre',
            to: `/search/genre${q ? '?q=' + q : ''}`,
          },
          { label: 'User', to: `/search/user${q ? '?q=' + q : ''}` },
        ]}
      />
      {q ? <Outlet context={{ q }} /> : <div></div>}
    </AppPageWrapper>
  );
};

export default SearchPageWrapper;
