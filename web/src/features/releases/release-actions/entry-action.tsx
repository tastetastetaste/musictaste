import { IconPlus, IconX } from '@tabler/icons-react';
import { IconButton, IconButtonProps } from '../../../components/icon-button';
import { useReleaseActions } from './useReleaseActions';

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
  const remove = () => {
    const confirmed = confirm('Remove your all activities on this release?');
    if (confirmed) {
      removeEntry();
    }
  };

  return (
    <IconButton
      title="Remove"
      onClick={remove}
      disabled={loading}
      danger
      active
      variant={variant}
    >
      <IconX />
    </IconButton>
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
