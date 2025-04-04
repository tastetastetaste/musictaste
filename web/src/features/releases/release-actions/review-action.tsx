import { IconNote } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Group } from '../../../components/flex/group';
import { Stack } from '../../../components/flex/stack';
import { IconButton } from '../../../components/icon-button';
import { Textarea } from '../../../components/inputs/textarea';
import { useReleaseActions } from './useReleaseActions';

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

  useEffect(() => {
    reset({
      body: entry?.review?.body || '',
    });
  }, [entry?.review, reset]);

  const submit = async ({ body }: any) => {
    await reviewAction(body);
    onClose();
  };

  const removeReview = async () => {
    const confirmed = confirm('Do you want to remove your review?');
    if (confirmed) {
      await reviewAction();
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Textarea
          placeholder="Review (supports Markdown)"
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
            <Button variant="text" onClick={removeReview} danger>
              Remove
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  );
};

export const ReviewAction = ({ releaseId }: { releaseId: string }) => {
  const [showDialog, setShowDialog] = useState(false);

  const { entry } = useReleaseActions(releaseId);

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
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Review"
      >
        <ReviewForm
          releaseId={releaseId}
          onClose={() => setShowDialog(false)}
        />
      </Dialog>
    </Fragment>
  );
};
