import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { LabelSearchLink } from './search-links';
import { SearchPageOutletContext } from './search-page-wrapper';

export const SearchLabel = ({ q }: { q: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['labels'],
      page: 1,
      pageSize: 100,
    }),
    () =>
      api.search({
        q: q!,
        type: ['labels'],
        page: 1,
        pageSize: 100,
      }),
    { enabled: !!q },
  );

  const labels = data?.labels;

  if (!q) return null;

  if (isLoading) return <span>loading</span>;

  if (labels && labels.length === 0) return null;

  return (
    <Fragment>
      <Stack gap="md">
        {labels &&
          labels.map((label) => (
            <LabelSearchLink key={label.id} label={label} />
          ))}
      </Stack>
    </Fragment>
  );
};

const SearchLabelPage = () => {
  const { q } = useOutletContext<SearchPageOutletContext>();

  return <SearchLabel q={q} />;
};

export default SearchLabelPage;
