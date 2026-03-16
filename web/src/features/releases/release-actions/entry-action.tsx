import { IconPlus, IconX } from '@tabler/icons-react';
import { IconButton, IconButtonProps } from '../../../components/icon-button';
import { useReleaseActions } from './useReleaseActions';
import { ConfirmDialog } from '../../../components/dialog/confirm-dialog';
import { useState } from 'react';

interface CreateEntryProps {
  createEntry: () => void;
  loading: boolean;
  variant?: IconButtonProps['variant'];
}

const CreateEntry = ({ createEntry, loading, variant }: CreateEntryProps) => {
  return (
    <IconButton
      title="Add"
      onClick={createEntry}
      disabled={loading}
      variant={variant}
    >
      <IconPlus />
    </IconButton>
  );
};

const RemoveEntry = ({
  removeEntry,
  loading,
  variant,
}: {
  loading: boolean;
  removeEntry: () => Promise<any>;
  variant?: IconButtonProps['variant'];
}) => {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  return (
    <>
      <IconButton
        title="Remove"
        onClick={() => setOpenRemoveDialog(true)}
        disabled={loading}
        danger
        active
        variant={variant}
      >
        <IconX />
      </IconButton>
      <ConfirmDialog
        isOpen={openRemoveDialog}
        onClose={() => setOpenRemoveDialog(false)}
        title="Remove Entry"
        description="Are you sure you want to remove all activities on this release?"
        onConfirm={removeEntry}
        danger
      />
    </>
  );
};

export const EntryAction = ({
  releaseId,
  variant,
}: {
  releaseId: string;
  variant?: IconButtonProps['variant'];
}) => {
  const {
    entry,
    createEntry,
    removeEntry,
    createEntryLoading,
    removeEntryLoading,
  } = useReleaseActions(releaseId);

  return entry && entry.id ? (
    <RemoveEntry
      removeEntry={removeEntry}
      loading={removeEntryLoading}
      variant={variant}
    />
  ) : (
    <CreateEntry
      createEntry={createEntry}
      loading={createEntryLoading}
      variant={variant}
    />
  );
};
