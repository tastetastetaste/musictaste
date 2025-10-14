import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { api } from '../../utils/api';

interface AddByIdLabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLabel: (label: { label: string; value: string }) => void;
  currentLabels: { label: string; value: string }[];
}

export const AddByIdLabelDialog = ({
  isOpen,
  onClose,
  onAddLabel,
  currentLabels,
}: AddByIdLabelDialogProps) => {
  const [labelId, setLabelId] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync: fetchLabel, isLoading } = useMutation(api.getLabel, {
    onSuccess: (data) => {
      const label = { label: data.label.name, value: data.label.id };

      if (currentLabels.some((l) => l.value === label.value)) {
        setError('Already added');
        return;
      }

      onAddLabel(label);
      setLabelId('');
      setError('');
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Not found');
    },
  });

  const handleAdd = () => {
    if (!labelId.trim()) {
      setError('Enter a label ID');
      return;
    }

    setError('');
    fetchLabel(labelId.trim());
  };

  const handleClose = () => {
    setLabelId('');
    setError('');
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Select Label by ID">
      <Stack gap="sm">
        <Input
          placeholder="Label ID"
          value={labelId}
          onChange={(e) => setLabelId(e.target.value)}
        />
        {error && <FormInputError error={{ message: error }} />}
        <Button variant="main" onClick={handleAdd} disabled={isLoading}>
          {isLoading ? 'Selecting...' : 'Select Label'}
        </Button>
      </Stack>
    </Dialog>
  );
};
