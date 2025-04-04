import { useInfiniteQuery, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { FetchMore } from '../../components/fetch-more';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { Feedback } from '../../components/feedback';
import { useAuth } from '../account/useAuth';
import DraggableList from './draggable-list';
import { cacheKeys } from '../../utils/cache-keys';

const EditListPage = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(
    cacheKeys.listKey(id),
    () => api.getList(id!),
    {
      enabled: !!id,
    },
  );
  const list = data && data.list;

  const { me } = useAuth();

  const isMyList = me && list && list.userId === me.id;

  const {
    status,
    data: data2,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    cacheKeys.listItemsKey(id),
    ({ pageParam = 1 }) => api.getListItems(id!, pageParam),
    {
      getNextPageParam: (lastPage, pages) =>
        pages.length < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
      enabled: !!id,
    },
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && !list) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }

  return (
    <AppPageWrapper
      title={`${(data && data.list && data.list.title) || ''} | Edit List`}
    >
      {isMyList && data2 ? (
        <div>
          <DraggableList
            list={{
              id: id!,
              items: data2.pages.map((page) => page.items).flat(),
            }}
          />
          {hasNextPage && !isFetching && (
            <FetchMore handleFetchMore={fetchNextPage} />
          )}
        </div>
      ) : (
        <div>...</div>
      )}
    </AppPageWrapper>
  );
};

export default EditListPage;
