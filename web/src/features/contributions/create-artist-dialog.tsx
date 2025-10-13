import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateArtistDto, getArtistPath } from 'shared';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

const CreateArtistDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const qc = useQueryClient();

  const defaultValues = {
    name: '',
    nameLatin: '',
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<CreateArtistDto>({
    resolver: classValidatorResolver(CreateArtistDto),
    defaultValues,
  });

  const { mutateAsync, isLoading, data } = useMutation(api.createArtist, {
    onSuccess: () =>
      qc.invalidateQueries(
        cacheKeys.searchKey({
          type: ['artists'],
        }),
      ),
  });

  const createArtist = async (data: CreateArtistDto) => {
    mutateAsync(data);
  };

  useEffect(() => {
    reset(defaultValues);
  }, [isSubmitSuccessful]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Artist/Band">
      <form
        onSubmit={handleSubmit(createArtist)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        <Stack gap="sm">
          <Input placeholder="Name" {...register('name')} />
          <FormInputError error={errors.name} />
          <Input
            placeholder="English / Latin-script name (if applicable)"
            {...register('nameLatin')}
          />
          <FormInputError error={errors.nameLatin} />
          <Button variant="main" type="submit" disabled={isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
      <div>
        {data?.message && <Typography>{data.message}</Typography>}
        {data?.artist && (
          <Link to={getArtistPath({ artistId: data.artist.id })}>
            {' '}
            {getArtistPath({ artistId: data.artist.id })}
          </Link>
        )}
      </div>
    </Dialog>
  );
};

export default CreateArtistDialog;
