import { CreateArtistDto } from 'shared';
import { api } from '../../utils/api';
import { useMutation, useQueryClient } from 'react-query';
import { getArtistPathname } from '../../utils/get-pathname';
import { Dialog } from '../../components/dialog';
import { Button } from '../../components/button';
import { Input } from '../../components/inputs/input';
import { useForm } from 'react-hook-form';
import { Stack } from '../../components/flex/stack';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Typography } from '../../components/typography';
import { Link } from '../../components/links/link';
import { useEffect } from 'react';
import { FormInputError } from '../../components/inputs/form-input-error';
import { cacheKeys } from '../../utils/cache-keys';

const CreateArtistDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const qc = useQueryClient();

  const defaultValues = {
    name: '',
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
      <form onSubmit={handleSubmit(createArtist)}>
        <Stack gap="sm">
          <Input placeholder="Name" {...register('name')} />
          <FormInputError error={errors.name} />
          <Button variant="main" type="submit" disabled={isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
      <div>
        {data?.message && <Typography>{data.message}</Typography>}
        {data?.artist && (
          <Link to={getArtistPathname(data.artist.id)}>
            {' '}
            {getArtistPathname(data.artist.id)}
          </Link>
        )}
      </div>
    </Dialog>
  );
};

export default CreateArtistDialog;
