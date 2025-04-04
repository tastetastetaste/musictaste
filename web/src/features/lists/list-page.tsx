import {
  IconClock,
  IconFilePencil,
  IconHeart,
  IconHeartFilled,
  IconLayoutGrid,
  IconLayoutList,
  IconLock,
  IconMessage,
  IconStarFilled,
  IconTransform,
} from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { IListResponse } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Feedback } from '../../components/feedback';
import { Group } from '../../components/flex/group';
import { IconButton } from '../../components/icon-button';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { formatDate } from '../../utils/date-format';
import { useAuth } from '../account/useAuth';
import { User } from '../users/user';
import DeleteListDialog from './delete-list-dialog';
import ListComments from './list-comments';
import ListItems from './list-items';
import UpdateListDialog from './update-list-dialog';
import { ReportDialog } from '../reports/report-dialog';
import { cacheKeys } from '../../utils/cache-keys';

const ListLike = ({
  likedByMe,
  likesCount,
  id,
}: {
  likedByMe: boolean;
  id: string;
  likesCount: number;
}) => {
  const qc = useQueryClient();

  const { mutateAsync: removeListLike } = useMutation(api.removeListLike, {
    onSuccess: () => qc.refetchQueries(cacheKeys.listKey(id)),
  });

  const { mutateAsync: createListLike } = useMutation(api.createListLike, {
    onSuccess: () => qc.refetchQueries(cacheKeys.listKey(id)),
  });

  return (
    <IconButton
      title="Like"
      num={likesCount}
      onClick={() => (likedByMe ? removeListLike(id) : createListLike(id))}
      active={likedByMe}
    >
      {likedByMe ? <IconHeartFilled /> : <IconHeart />}
    </IconButton>
  );
};

const ListBody = ({
  list,
  isMyList,
  openEditListDialog,
}: {
  list: IListResponse['list'];
  isMyList?: boolean | null;
  openEditListDialog: any;
}) => {
  if (!list) throw new Error('');

  const [showComments, setShowComments] = useState(false);

  const qc = useQueryClient();

  const { mutateAsync: publishListMutation, isLoading } = useMutation(
    api.publishList,
    {
      onSuccess: () => qc.refetchQueries(cacheKeys.listKey(list.id)),
    },
  );

  const navigate = useNavigate();

  const publish = () => {
    const confirmed = confirm('Do you want to publish this list?');

    if (!confirmed) {
      return;
    }

    publishListMutation(list.id);
  };

  return (
    <Container>
      <Group justify="apart">
        <Group gap="sm">
          <span>List By</span>
          <User user={list.user} />
        </Group>
        {isMyList && (
          <Group gap={10}>
            <IconButton
              title="Reorder"
              onClick={() => navigate(`/list/${list.id}/edit`)}
            >
              <IconTransform />
            </IconButton>
            <IconButton title="Edit" onClick={openEditListDialog}>
              <IconFilePencil />
            </IconButton>
          </Group>
        )}
      </Group>
      <Typography size="title-xl">{list.title}</Typography>
      {list.description && <Markdown>{list.description}</Markdown>}
      <Group justify="apart">
        <Group gap={10}>
          <Group gap={5}>
            {list.grid ? <IconLayoutGrid /> : <IconLayoutList />}
            <span>{list.listItemsCount} Items</span>
          </Group>
          {list.published ? (
            <Fragment>
              <Group gap={5}>
                <IconStarFilled />
                <span>{formatDate(list.publishedDate)}</span>
              </Group>
              <Group gap={5}>
                <IconClock />
                <span>{formatDate(list.updatedAt)}</span>
              </Group>
            </Fragment>
          ) : (
            <Group gap={5} align="center">
              <IconLock />
              <span>Private</span>
              <Button variant="text" onClick={publish}>
                {isLoading ? '...' : 'Publish'}
              </Button>
            </Group>
          )}
        </Group>
        <Group gap="sm">
          <ListLike
            likedByMe={list.likedByMe}
            likesCount={list.likesCount}
            id={list.id}
          />
          <IconButton
            title="Comments"
            num={list.commentsCount}
            onClick={() => setShowComments(!showComments)}
            active={showComments}
          >
            <IconMessage />
          </IconButton>
        </Group>
      </Group>
      {showComments && (
        <ListComments listId={list.id} commentsCount={list.commentsCount} />
      )}
    </Container>
  );
};

const ListPage = () => {
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

  const [editListDialogOpen, setEditListDialogOpen] = useState(false);
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);

  const [openReport, setOpenReport] = useState(false);

  const openEditListDialog = () => setEditListDialogOpen(true);

  const menu = isMyList
    ? [{ label: 'Delete List', action: () => setDeleteListDialogOpen(true) }]
    : [{ label: 'Report', action: () => setOpenReport(true) }];

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && !list) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }
  return (
    <AppPageWrapper title={(list && list.title) || undefined} menu={menu}>
      {isLoading ? (
        <Loading />
      ) : list ? (
        <ListItems
          id={list.id}
          ranked={list.ranked}
          grid={list.grid}
          listItemsCount={list.listItemsCount}
        >
          <ListBody
            list={list}
            isMyList={isMyList}
            openEditListDialog={openEditListDialog}
          />
        </ListItems>
      ) : (
        <div></div>
      )}
      {isMyList && list ? (
        <Fragment>
          <UpdateListDialog
            list={list}
            IsOpen={editListDialogOpen}
            close={() => setEditListDialogOpen(false)}
          />
          <DeleteListDialog
            list={list}
            IsOpen={deleteListDialogOpen}
            close={() => setDeleteListDialogOpen(false)}
          />
        </Fragment>
      ) : (
        <div></div>
      )}
      <ReportDialog
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        id={id}
        type="list"
      />
    </AppPageWrapper>
  );
};

export default ListPage;
