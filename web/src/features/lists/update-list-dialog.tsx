import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getListPath, UpdateListDto } from 'shared';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { Checkbox } from '../../components/inputs/checkbox';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { TextareaWithPreview } from '../../components/inputs/textarea-with-preview';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

type ListToUpdate = any;

const UpdateListForm: React.FC<{
  list: ListToUpdate;
  redirect?: boolean;
  closeDialog: () => void;
}> = ({ list, redirect = false, closeDialog }) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(api.updateList, {
    onSuccess: () => {
      queryClient.refetchQueries(cacheKeys.listKey(list.id));
    },
  });

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateListDto>({
    resolver: classValidatorResolver(
      UpdateListDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  const submit = async (input: UpdateListDto) => {
    const data = await mutateAsync({
      id: list.id,
      ...input,
    });
    closeDialog();
    redirect &&
      data.data &&
      navigate(getListPath({ listId: data.data?.updateList.id }));
  };

  useEffect(() => {
    reset({
      title: list.title,
      description: list.descriptionSource || '',
      grid: list.grid,
      ranked: list.ranked,
    });
  }, [list]);

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Input
          type="text"
          name="title"
          placeholder="title"
          {...register('title')}
        />
        <FormInputError error={errors.title} />
        <TextareaWithPreview
          placeholder="Description"
          {...register('description', { required: false })}
          rows={22}
        />
        <FormInputError error={errors.description} />
        <Controller
          name="grid"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              onChange={(value) => field.onChange(value)}
              label="Grid Layout"
            />
          )}
        />
        <Controller
          name="ranked"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              onChange={(value) => field.onChange(value)}
              label="Display Rank"
            />
          )}
        />

        <Button type="submit" disabled={isLoading}>
          save
        </Button>
      </Stack>
    </form>
  );
};

const UpdateListDialog: React.FC<{
  list: ListToUpdate;
  IsOpen: boolean;
  close: () => void;
}> = ({ list, IsOpen, close }) => {
  return (
    <Dialog isOpen={IsOpen} onClose={close} title="Edit List">
      <UpdateListForm list={list} closeDialog={close} />
    </Dialog>
  );
};

export default UpdateListDialog;
