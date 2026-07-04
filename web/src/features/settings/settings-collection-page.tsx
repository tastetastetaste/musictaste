import {
  IconArrowDown,
  IconArrowUp,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IUserCollectionView, SupporterStatus } from 'shared';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Feedback } from '../../components/feedback';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Link } from '../../components/links/link';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SettingsPageOutletContext } from './settings-page-wrapper';
import { CollectionViewFormDialog } from './collection-view-form-dialog';
import { ConfirmDialog } from '../../components/dialog/confirm-dialog';

const SettingsCollectionPage = () => {
  const { user } = useOutletContext<SettingsPageOutletContext>();
  const { snackbar } = useSnackbar();
  const qc = useQueryClient();

  const { data: collectionViews = [], isLoading } = useQuery(
    cacheKeys.userCollectionViewsKey(),
    () => api.getUserCollectionViews(),
  );

  const isSupporter = user.supporter >= SupporterStatus.SUPPORTER;
  const limit = isSupporter ? 10 : 2;
  const isLimitReached = collectionViews.length >= limit;

  const { mutateAsync: deleteView } = useMutation(
    api.deleteUserCollectionView,
    {
      onSuccess: () => {
        qc.invalidateQueries(cacheKeys.userCollectionViewsKey());
        qc.invalidateQueries(cacheKeys.userProfileKey(user.username));
        snackbar('Collection view deleted');
      },
    },
  );

  const { mutateAsync: reorderViews } = useMutation(
    api.reorderUserCollectionViews,
    {
      onSuccess: () => {
        qc.invalidateQueries(cacheKeys.userCollectionViewsKey());
        qc.invalidateQueries(cacheKeys.userProfileKey(user.username));
      },
    },
  );

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editingView, setEditingView] = useState<IUserCollectionView | null>(
    null,
  );
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null);

  const handleCreateOpen = () => {
    setEditingView(null);
    setIsOpen(true);
  };

  const handleEditOpen = (cv: IUserCollectionView) => {
    setEditingView(cv);
    setIsOpen(true);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const list = [...collectionViews];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const ids = list.map((cv) => cv.id);
    await reorderViews(ids);
  };

  return (
    <Container>
      <Stack gap="md">
        <Group justify="apart">
          <Stack gap="sm">
            <Typography size="title-lg">
              Collection Views ({collectionViews.length}/
              {user.supporter >= SupporterStatus.SUPPORTER ? 10 : 2})
            </Typography>
            <Typography size="small">
              Create separate views to organize your music collection.{' '}
              {user.supporter < SupporterStatus.SUPPORTER ? (
                <Link to="/support-us" size="small">
                  Become a Supporter to unlock up to 10 collection views.
                </Link>
              ) : (
                ''
              )}
            </Typography>
          </Stack>
          <Button
            variant="main"
            onClick={handleCreateOpen}
            disabled={isLimitReached}
          >
            + Add View
          </Button>
        </Group>

        {isLoading ? (
          <Loading />
        ) : collectionViews.length === 0 ? (
          <Feedback message="No collection views." />
        ) : (
          <Stack gap="sm">
            {collectionViews.map((cv, index) => (
              <div
                key={cv.id}
                css={(theme) => ({
                  background: theme.colors.background_sub,
                  borderRadius: theme.border_radius.base,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <Typography size="body-bold">{cv.title}</Typography>
                <Group gap="sm">
                  <IconButton
                    title="Move Up"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                  >
                    <IconArrowUp size={16} />
                  </IconButton>
                  <IconButton
                    title="Move Down"
                    disabled={index === collectionViews.length - 1}
                    onClick={() => handleMove(index, 'down')}
                  >
                    <IconArrowDown size={16} />
                  </IconButton>
                  <IconButton title="Edit" onClick={() => handleEditOpen(cv)}>
                    <IconPencil size={16} />
                  </IconButton>
                  <IconButton
                    title="Delete"
                    danger
                    onClick={() => setDeletingViewId(cv.id)}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Group>
              </div>
            ))}
          </Stack>
        )}
      </Stack>

      <CollectionViewFormDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        editingView={editingView}
      />

      <ConfirmDialog
        isOpen={!!deletingViewId}
        onClose={() => setDeletingViewId(null)}
        title="Delete Collection View"
        description="Are you sure you want to delete this collection view?"
        onConfirm={() => deleteView(deletingViewId)}
        danger
      />
    </Container>
  );
};

export default SettingsCollectionPage;
