import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Feedback } from '../../components/feedback';
import { FetchMore } from '../../components/fetch-more';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';
import DraggableList from './draggable-list';
import { IconTransform } from '@tabler/icons-react';
import { Typography } from '../../components/typography';

const EditListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const quickActions = [
    {
      label: 'Done Editing', // dont really know what this should be
      action: () => navigate(`/list/${id}`),
      icon: IconTransform,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && !list) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }

  return (
    <AppPageWrapper
      title={`${(data && data.list && data.list.title) || ''} | Edit List`}
      quickActions={quickActions}
    >
      {isMyList && data2 ? (
        <div>
          <Typography size="title" css={{ marginBottom: 12 }}>
            Edit Items
          </Typography>
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