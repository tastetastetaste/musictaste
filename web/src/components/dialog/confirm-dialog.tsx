import { Dialog } from '.';
import { Button } from '../button';
import { Group } from '../flex/group';
import { Stack } from '../flex/stack';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  danger,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  danger?: boolean;
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <Stack gap="md">
        <span>{description}</span>
        <Group gap="md" justify="end">
          <Button
            variant={danger ? 'main' : 'highlight'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            danger={danger}
          >
            Confirm
          </Button>
          <Button variant="main" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Dialog>
  );
};
