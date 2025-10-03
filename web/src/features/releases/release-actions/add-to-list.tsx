import { IconMinus, IconPlaylistAdd, IconPlus } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { Button } from '../../../components/button';
import { FetchMore } from '../../../components/fetch-more';
import { Group } from '../../../components/flex/group';
import { IconButton } from '../../../components/icon-button';
import { Link } from '../../../components/links/link';
import { Loading } from '../../../components/loading';
import { Popover } from '../../../components/popover';
import { api } from '../../../utils/api';
import { useAuth } from '../../account/useAuth';
import { CreateListDialog } from '../../lists/create-list-dialog';
import { cacheKeys } from '../../../utils/cache-keys';
import { getListPath } from 'shared';

export const AddToListPopoverContent = ({
  releaseId,
  onOpenCreateList,
}: {
  releaseId: string;
  onOpenCreateList?: any;
}) => {
  const { me } = useAuth();

  const qc = useQueryClient();

  const updateCache = (id: string) => {
    qc.refetchQueries(cacheKeys.releaseInMyListsKey(releaseId));
    qc.removeQueries(cacheKeys.listItemsKey(id));
  };

  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    cacheKeys.userListsKey(me!.id),
    async ({ pageParam = 1 }) => api.getUserLists(me!.id, pageParam),
    {
      getNextPageParam: (lastPage, pages) =>
        pages.length < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
      enabled: !!me,
    },
  );

  const { data: inLists, isLoading: isLoading2 } = useQuery(
    cacheKeys.releaseInMyListsKey(releaseId),
    () => api.getReleaseInMyLists(releaseId),
    { enabled: !!me },
  );

  const { mutateAsync: addToListMu, isLoading } = useMutation(api.addToList);

  const { mutateAsync: removeFromListMu, isLoading: isRemoveLoading } =
    useMutation(api.removeFromList);

  const add = (id: string, releaseId: string) =>
    addToListMu(
      {
        id,
        releaseId,
      },
      {
        onSuccess: () => updateCache(id),
      },
    );

  const remove = (id: string, itemId: string) =>
    removeFromListMu(
      {
        id,
        itemId,
      },
      {
        onSuccess: () => updateCache(id),
      },
    );

  if ((isFetching && !isFetchingNextPage) || isLoading2) {
    return <Loading />;
  }

  return (
    <Fragment>
      <div>
        {data?.pages.map((page) => (
          <Fragment key={page.currentPage}>
            {page.lists.map((list) => (
              <Group justify="apart" align="center" key={list.id}>
                <Link to={getListPath({ listId: list.id })}>{list.title}</Link>
                {inLists?.some((li) => li.listId === list.id) ? (
                  <IconButton
                    title="Remove"
                    onClick={() =>
                      remove(
                        list.id,
                        inLists.find((li) => li.listId === list.id)!.itemId,
                      )
                    }
                    danger
                    disabled={isRemoveLoading}
                  >
                    <IconMinus />
                  </IconButton>
                ) : (
                  <IconButton
                    title="Add"
                    onClick={() => add(list.id, releaseId)}
                    disabled={isLoading}
                  >
                    <IconPlus />
                  </IconButton>
                )}
              </Group>
            ))}
          </Fragment>
        ))}

        {hasNextPage && !isFetching && (
          <FetchMore handleFetchMore={fetchNextPage} />
        )}
      </div>
      {onOpenCreateList && (
        <Button variant="text" onClick={onOpenCreateList}>
          Create List
        </Button>
      )}
    </Fragment>
  );
};

interface AddToListProps {
  releaseId: string;
}

export const AddToList = ({ releaseId }: AddToListProps) => {
  const [openCreateList, setOpenCreateList] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        content={
          <AddToListPopoverContent
            releaseId={releaseId}
            onOpenCreateList={() => setOpenCreateList(true)}
          />
        }
      >
        <IconButton
          title="Add to list"
          onClick={() => setOpen(!open)}
          variant="solid"
        >
          <IconPlaylistAdd />
        </IconButton>
      </Popover>
      <CreateListDialog
        isOpen={openCreateList}
        onClose={() => setOpenCreateList(false)}
      />
    </Fragment>
  );
};
