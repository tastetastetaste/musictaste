import { useState } from 'react';
import { useMutation } from 'react-query';
import { api } from '../../utils/api';
import { Dialog } from '../../components/dialog';
import { Button } from '../../components/button';
import { Input } from '../../components/inputs/input';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';

interface AddByIdArtistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArtist: (artist: { label: string; value: string }) => void;
  currentArtists: { label: string; value: string }[];
}

export const AddByIdArtistDialog = ({
  isOpen,
  onClose,
  onAddArtist,
  currentArtists,
}: AddByIdArtistDialogProps) => {
  const [artistId, setArtistId] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync: fetchArtist, isLoading } = useMutation(api.getArtist, {
    onSuccess: (data) => {
      const artist = { label: data.artist.name, value: data.artist.id };

      if (currentArtists.some((a) => a.value === artist.value)) {
        setError('Already added');
        return;
      }

      onAddArtist(artist);
      setArtistId('');
      setError('');
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Not found');
    },
  });

  const handleAdd = () => {
    if (!artistId.trim()) {
      setError('Enter an artist ID');
      return;
    }

    setError('');
    fetchArtist(artistId.trim());
  };

  const handleClose = () => {
    setArtistId('');
    setError('');
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Select Artist by ID">
      <Stack gap="sm">
        <Input
          placeholder="Artist ID"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
        />
        {error && <FormInputError error={{ message: error }} />}
        <Button variant="main" onClick={handleAdd} disabled={isLoading}>
          {isLoading ? 'Selecting...' : 'Select Artist'}
        </Button>
      </Stack>
    </Dialog>
  );
};
