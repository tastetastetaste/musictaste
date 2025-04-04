import { EntriesSortByEnum } from 'shared';
import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Group } from '../../components/flex/group';
import { api } from '../../utils/api';
import { FetchMore } from '../../components/fetch-more';
import { Loading } from '../../components/loading';
import { UserRating } from '../ratings/rating';
import { ReleasePageOutletContext } from './release-page-wrapper';
import { User } from '../users/user';
import { cacheKeys } from '../../utils/cache-keys';

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
      sortBy: EntriesSortByEnum.RatingDate,
    }),
    async ({ pageParam = 1 }) =>
      api.getEntries({
        releaseId,
        page: pageParam,
        pageSize: 48,
        sortBy: EntriesSortByEnum.RatingDate,
      }),
    {
      getNextPageParam: (lastPage, pages) =>
        pages.length < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
    },
  );

  /*

  page: 1
  totalItems: 1
  currentPage: 1
  pageSize: 48
  currentItems: 1
  itemsPerPage: 48
  totalPages: 1


  */

  return (
    <Fragment>
      {isFetching && !isFetchingNextPage && <Loading />}
      <Group wrap gap={20}>
        {data?.pages.map((page) => (
          <Fragment key={page.currentPage}>
            {page.entries.map((entry) => (
              <Group gap={10} key={entry.id}>
                <User user={entry.user!} />
                <UserRating rating={entry.rating} />
              </Group>
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
