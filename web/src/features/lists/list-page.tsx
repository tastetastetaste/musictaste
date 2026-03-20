import {
  IconClock,
  IconLayoutGrid,
  IconLayoutList,
  IconLock,
  IconStarFilled,
  IconTransform,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IListResponse, ReportType } from 'shared';
import { Button } from '../../components/button';
import { StickyContainer } from '../../components/containers/sticky-container';
import { ConfirmDialog } from '../../components/dialog/confirm-dialog';
import { Feedback } from '../../components/feedback';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { formatDate } from '../../utils/date-format';
import { useAuth } from '../account/useAuth';
import { ReportDialog } from '../reports/report-dialog';
import { UserThemeProvider } from '../theme/user-theme-provider';
import { User } from '../users/user';
import { ListActivity } from './list-activity';
import ListItems from './list-items';
import UpdateListDialog from './update-list-dialog';

const ListBody = ({ list }: { list: IListResponse['list'] }) => {
  if (!list) throw new Error('');

  const [openPublishDialog, setOpenPublishDialog] = useState(false);

  const qc = useQueryClient();

  const { mutateAsync: publishListMutation, isLoading } = useMutation(
    api.publishList,
    {
      onSuccess: () => qc.refetchQueries(cacheKeys.listKey(list.id)),
    },
  );

  const statsIconSize = 16;

  return (
    <Stack>
      <Group justify="apart" wrap gap={10}>
        <User user={list.user} />
        <Group gap={10} wrap>
          <Group gap={5}>
            {list.grid ? (
              <IconLayoutGrid size={statsIconSize} />
            ) : (
              <IconLayoutList size={statsIconSize} />
            )}
            <Typography size="small" color="sub">
              {list.listItemsCount} Items
            </Typography>
          </Group>
          {list.published ? (
            <Fragment>
              <Group gap={5}>
                <IconStarFilled size={statsIconSize} />
                <Typography size="small" color="sub">
                  {formatDate(list.publishedDate)}
                </Typography>
              </Group>
              <Group gap={5}>
                <IconClock size={statsIconSize} />
                <Typography size="small" color="sub">
                  {formatDate(list.updatedAt)}
                </Typography>
              </Group>
            </Fragment>
          ) : (
            <Group gap={5} align="center">
              <IconLock size={statsIconSize} />
              <Typography size="small" color="sub">
                Private
              </Typography>
              <Button variant="main" onClick={() => setOpenPublishDialog(true)}>
                {isLoading ? '...' : 'Publish'}
              </Button>
            </Group>
          )}
        </Group>
      </Group>
      <Typography size="title-xl">{list.title}</Typography>
      {list.description && <Markdown>{list.description}</Markdown>}
      <ConfirmDialog
        isOpen={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        title="Publish List"
        description="Are you sure you want to publish this list?"
        onConfirm={() => publishListMutation(list.id)}
      />
    </Stack>
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

  const navigate = useNavigate();

  const isMobile = useMediaQuery({ down: 'lg' });

  const { me } = useAuth();

  const qc = useQueryClient();

  const { mutateAsync: deleteListMutation } = useMutation(api.deleteList, {
    onSettled: () => qc.invalidateQueries(cacheKeys.userListsKey(me.id)),
  });

  const deleteList = async () => {
    await deleteListMutation(list.id);
    navigate(-1);
  };

  const list = data && data.list;

  const isMyList = me && list && list.userId === me.id;

  const [editListDialogOpen, setEditListDialogOpen] = useState(false);
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);

  const [openReport, setOpenReport] = useState(false);

  const openEditListDialog = () => setEditListDialogOpen(true);

  const menu = isMyList
    ? [
        {
          label: 'Edit List',
          action: openEditListDialog,
        },
        {
          label: 'Delete List',
          action: () => setDeleteListDialogOpen(true),
        },
      ]
    : [
        {
          label: 'Report',
          action: () => setOpenReport(true),
        },
      ];

  const quickActions = isMyList
    ? [
        {
          label: 'Reorder Items',
          action: () => navigate(`/list/${list.id}/edit`),
          icon: IconTransform,
        },
      ]
    : [];

  if (!isLoading && !list) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }
  return (
    <UserThemeProvider user={list?.user}>
      <AppPageWrapper
        title={(list && list.title) || undefined}
        menu={menu}
        quickActions={quickActions}
      >
        {isLoading ? (
          <Loading />
        ) : list ? (
          <Group align="start" gap="lg">
            <FlexChild grow>
              <ListItems
                id={list.id}
                ranked={list.ranked}
                grid={list.grid}
                listItemsCount={list.listItemsCount}
              >
                <ListBody list={list} />
                {isMobile ? <ListActivity isMobile list={list} /> : null}
              </ListItems>
            </FlexChild>
            {!isMobile ? (
              <StickyContainer width={400}>
                <ListActivity list={list} />
              </StickyContainer>
            ) : null}
          </Group>
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
            <ConfirmDialog
              isOpen={deleteListDialogOpen}
              onClose={() => setDeleteListDialogOpen(false)}
              title="Delete List"
              description="Are you sure you want to delete this list?"
              onConfirm={deleteList}
              danger
            />
          </Fragment>
        ) : (
          <div></div>
        )}
        <ReportDialog
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          id={id}
          type={ReportType.LIST}
        />
      </AppPageWrapper>
    </UserThemeProvider>
  );
};

export default ListPage;
