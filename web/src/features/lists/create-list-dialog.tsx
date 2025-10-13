import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CreateListDto, getListPath } from 'shared';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { Checkbox } from '../../components/inputs/checkbox';
import { FormInputError } from '../../components/inputs/form-input-error';
import { Input } from '../../components/inputs/input';
import { Textarea } from '../../components/inputs/textarea';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';

const CreateListForm = ({ redirect = false, closeDialog }: any) => {
  const navigate = useNavigate();

  const { me } = useAuth();

  const qc = useQueryClient();

  const { mutateAsync: createList, isLoading } = useMutation(api.createList, {
    onSettled: () => qc.refetchQueries(cacheKeys.userListsKey(me.id)),
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<CreateListDto>({
    resolver: classValidatorResolver(
      CreateListDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  const submit = async (input: CreateListDto) => {
    const data = await createList(input);
    closeDialog();
    redirect &&
      data.data &&
      navigate(getListPath({ listId: data.data?.createList.id }));
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Input placeholder="Title" {...register('title')} />
        <FormInputError error={errors.title} />
        <Textarea
          placeholder="Description"
          {...register('description', { required: false })}
        />
        <FormInputError error={errors.description} />
        <Controller
          name="grid"
          control={control}
          defaultValue={false}
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
          defaultValue={false}
          render={({ field }) => (
            <Checkbox
              {...field}
              onChange={(value) => field.onChange(value)}
              label="Display Rank"
            />
          )}
        />
        <Button type="submit" disabled={isLoading}>
          Save Draft
        </Button>
      </Stack>
    </form>
  );
};

export const CreateListDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create List">
      <CreateListForm redirect={true} closeDialog={onClose} />
    </Dialog>
  );
};
