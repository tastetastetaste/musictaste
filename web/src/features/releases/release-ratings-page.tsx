import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EntriesSortByEnum } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Group } from '../../components/flex/group';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ReleasePageOutletContext } from './release-page-wrapper';
import { UserEntry } from './user-entry';

const ReleaseRatingsPage = () => {
  const { releaseId } = useOutletContext<ReleasePageOutletContext>();

  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    cacheKeys.entriesKey({
      releaseId,
      pageSize: 48,
      sortBy: EntriesSortByEnum.EntryDate,
    }),
    async ({ pageParam = 1 }) =>
      api.getEntries({
        releaseId,
        page: pageParam,
        pageSize: 48,
        sortBy: EntriesSortByEnum.EntryDate,
      }),
    {
      getNextPageParam: (lastPage, pages) =>
        pages.length < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
    },
  );

  return (
    <Fragment>
      {isFetching && !isFetchingNextPage && <Loading />}
      <Group wrap gap={20}>
        {data?.pages.map((page) => (
          <Fragment key={page.currentPage}>
            {page.entries.map((entry) => (
              <UserEntry key={entry.id} entry={entry} />
            ))}
          </Fragment>
        ))}
      </Group>
      {!isFetching && hasNextPage && (
        <FetchMore handleFetchMore={fetchNextPage} />
      )}
    </Fragment>
  );
};

export default ReleaseRatingsPage;
