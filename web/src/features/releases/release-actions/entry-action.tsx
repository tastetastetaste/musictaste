import { IconPlus, IconX } from '@tabler/icons-react';
import { IconButton } from '../../../components/icon-button';
import { useReleaseActions } from './useReleaseActions';

interface CreateEntryProps {
  createEntry: () => void;
  loading: boolean;
}

const CreateEntry = ({ createEntry, loading }: CreateEntryProps) => {
  return (
    <IconButton
      title="Add"
      onClick={createEntry}
      disabled={loading}
      variant="solid"
    >
      <IconPlus />
    </IconButton>
  );
};

const RemoveEntry = ({
  removeEntry,
  loading,
}: {
  loading: boolean;
  removeEntry: () => Promise<any>;
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
      variant="solid"
    >
      <IconX />
    </IconButton>
  );
};

export const EntryAction = ({ releaseId }: { releaseId: string }) => {
  const {
    entry,
    createEntry,
    removeEntry,
    createEntryLoading,
    removeEntryLoading,
  } = useReleaseActions(releaseId);

  return entry && entry.id ? (
    <RemoveEntry removeEntry={removeEntry} loading={removeEntryLoading} />
  ) : (
    <CreateEntry createEntry={createEntry} loading={createEntryLoading} />
  );
};
