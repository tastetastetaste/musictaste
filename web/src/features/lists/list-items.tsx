import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { Loading } from '../../components/loading';
import { ListItemsVirtualGrid } from './list-items-virtual-grid';
import { ListItemsVirtualList } from './list-items-virtual-list';
import { cacheKeys } from '../../utils/cache-keys';

const ListItems: React.FC<{
  id: string;
  ranked: boolean;
  grid: boolean;
  listItemsCount: number;
  children: JSX.Element | JSX.Element[];
}> = ({ id, ranked, grid, listItemsCount, children }) => {
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    cacheKeys.listItemsKey(id),
    ({ pageParam = 1 }) => api.getListItems(id, pageParam),
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
      {data &&
        (grid ? (
          <ListItemsVirtualGrid
            hasMore={hasNextPage || false}
            data={data}
            loadMore={fetchNextPage}
            ranked={ranked}
          >
            {children}
          </ListItemsVirtualGrid>
        ) : (
          <ListItemsVirtualList
            data={data}
            hasMore={hasNextPage || false}
            loadMore={fetchNextPage}
            ranked={ranked}
          >
            {children}
          </ListItemsVirtualList>
        ))}
    </Fragment>
  );
};

export default ListItems;
