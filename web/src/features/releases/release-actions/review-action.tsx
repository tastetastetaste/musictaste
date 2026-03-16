import { IconNote } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Group } from '../../../components/flex/group';
import { Stack } from '../../../components/flex/stack';
import { IconButton } from '../../../components/icon-button';
import { TextareaWithPreview } from '../../../components/inputs/textarea-with-preview';
import { useReleaseActions } from './useReleaseActions';
import { ConfirmDialog } from '../../../components/dialog/confirm-dialog';

const ReviewForm = ({
  releaseId,
  onClose,
}: {
  releaseId: string;
  onClose: () => void;
}) => {
  const { entry, reviewAction, updateEntryLoading, createEntryLoading } =
    useReleaseActions(releaseId);
  const { handleSubmit, register, reset } = useForm();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    reset({
      body: entry?.review?.bodySource || '',
    });
  }, [entry?.review, reset]);

  const submit = async ({ body }: any) => {
    await reviewAction(body);
    onClose();
  };

  const deleteReview = async () => {
    await reviewAction();
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <TextareaWithPreview
            placeholder="Review"
            {...register('body')}
            rows={22}
          />
          <Button
            type="submit"
            disabled={updateEntryLoading || createEntryLoading}
          >
            Save
          </Button>
          {entry?.review && (
            <Group justify="end">
              <Button
                variant="text"
                onClick={() => setOpenDeleteDialog(true)}
                danger
              >
                Delete
              </Button>
            </Group>
          )}
        </Stack>
      </form>
      <ConfirmDialog
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title="Delete Review"
        description="Are you sure you want to delete this review?"
        onConfirm={deleteReview}
        danger
      />
    </>
  );
};

export const ReviewAction = ({ releaseId }: { releaseId: string }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const { entry } = useReleaseActions(releaseId);

  const onClose = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowDialog(false);
    setShowConfirmClose(false);
  };

  return (
    <Fragment>
      <IconButton
        title="Review"
        onClick={() => setShowDialog(true)}
        active={!!entry?.review}
        variant="solid"
      >
        <IconNote />
      </IconButton>
      <Dialog isOpen={showDialog} onClose={onClose} title="Review">
        <ReviewForm
          releaseId={releaseId}
          onClose={() => setShowDialog(false)}
        />
      </Dialog>
      <ConfirmDialog
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        title="Close Review"
        description="Are you sure you want to close? Unsaved changes will be lost."
        onConfirm={handleConfirmClose}
      />
    </Fragment>
  );
};
