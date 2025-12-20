import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateLabelDto } from 'shared';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
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
    formState: { errors },
    reset,
  } = useForm<CreateLabelDto>({
    resolver: classValidatorResolver(CreateLabelDto),
    defaultValues,
  });

  const { mutateAsync, isLoading, data } = useMutation(api.createLabel, {
    onSuccess: () => {
      qc.invalidateQueries(cacheKeys.searchKey({ type: ['labels'] }));
      reset(defaultValues);
    },
  });

  const createLabel = async (data: CreateLabelDto) => {
    await mutateAsync(data);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Label">
      <form
        onSubmit={handleSubmit(createLabel)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
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
