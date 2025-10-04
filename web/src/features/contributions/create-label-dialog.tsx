import { CreateLabelDto } from 'shared';
import { api } from '../../utils/api';
import { useMutation, useQueryClient } from 'react-query';
import { Dialog } from '../../components/dialog';
import { useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Stack } from '../../components/flex/stack';
import { Input } from '../../components/inputs/input';
import { Typography } from '../../components/typography';
import { Button } from '../../components/button';
import { useEffect } from 'react';
import { FormInputError } from '../../components/inputs/form-input-error';
import { cacheKeys } from '../../utils/cache-keys';

const CreateLabelDialog: React.FC<{
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
  } = useForm<CreateLabelDto>({
    resolver: classValidatorResolver(CreateLabelDto),
    defaultValues,
  });

  const { mutateAsync, isLoading, data } = useMutation(api.createLabel, {
    onSuccess: () =>
      qc.invalidateQueries(cacheKeys.searchKey({ type: ['labels'] })),
  });

  const createLabel = async (data: CreateLabelDto) => {
    await mutateAsync(data);
  };

  useEffect(() => {
    reset(defaultValues);
  }, [isSubmitSuccessful]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Label">
      <form
        onSubmit={handleSubmit(createLabel)}
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
      <div>{data && <Typography>{data.message}</Typography>}</div>
    </Dialog>
  );
};

export default CreateLabelDialog;
