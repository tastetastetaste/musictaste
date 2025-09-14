import styled from '@emotion/styled';
import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { FetchMore } from '../../components/fetch-more';
import { List } from './list';
import { Loading } from '../../components/loading';
import { Feedback } from '../../components/feedback';
import { cacheKeys } from '../../utils/cache-keys';

export const LIST_GRID_PADDING = '8px';

const Container = styled.div`
  padding: 0;
  margin: 0;
  width: 100%;
  display: grid;
  grid-column-gap: ${LIST_GRID_PADDING};
  grid-row-gap: ${LIST_GRID_PADDING};

  grid-template-columns: repeat(1, minmax(0, 1fr));
  @media only screen and (min-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media only screen and (min-width: 960px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export interface ListsListRendererProps {
  sortBy?: 'new' | 'popular';
  releaseId?: string;
  userId?: string;
}

export function ListsListRenderer({
  sortBy,
  releaseId,
  userId,
}: ListsListRendererProps) {
  const cacheKey = releaseId
    ? cacheKeys.releaseListsKey(releaseId)
    : userId
      ? cacheKeys.userListsKey(userId)
      : sortBy === 'popular'
        ? cacheKeys.popularListsKey()
        : cacheKeys.newListsKey();

  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    cacheKey,
    async ({ pageParam = 1 }) =>
      releaseId
        ? api.getReleaseLists(releaseId, pageParam)
        : userId
          ? api.getUserLists(userId, pageParam)
          : sortBy === 'popular'
            ? api.getPopularLists(pageParam)
            : api.getNewLists(pageParam),
    {
      getNextPageParam: (lastPage, pages) =>
        pages.length < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
    },
  );

  if (isFetching && !isFetchingNextPage) {
    return <Loading />;
  }

  return (
    <div>
      {isFetching && !isFetchingNextPage ? (
        <Loading />
      ) : data && data.pages[0].totalItems > 0 ? (
        <Container>
          {data &&
            data.pages.map((page) => (
              <Fragment key={page.currentPage}>
                {page.lists.map((list) => (
                  <List key={list.id} list={list} withoutUser={!!userId} />
                ))}
              </Fragment>
            ))}
        </Container>
      ) : (
        <Feedback message="There are no lists" />
      )}
      {hasNextPage && !isFetching && (
        <FetchMore handleFetchMore={fetchNextPage} />
      )}
    </div>
  );
}

export default ListsListRenderer;
