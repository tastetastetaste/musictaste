import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { LabelSearchLink } from './search-links';
import { SearchPageOutletContext } from './search-page-wrapper';
import { cacheKeys } from '../../utils/cache-keys';

export const SearchLabel = ({ q }: { q: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['labels'],
      page: 1,
      pageSize: 12,
    }),
    () =>
      api.search({
        q: q!,
        type: ['labels'],
        page: 1,
        pageSize: 12,
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
