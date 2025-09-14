import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { UpdateUserProfileDto } from 'shared';
import { api } from '../../utils/api';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Textarea } from '../../components/inputs/textarea';
import { Input } from '../../components/inputs/input';
import { PROFILE_UPDATE_SUCCESS } from '../../static/feedback';
import { SettingsPageOutletContext } from './settings-page-wrapper';
import { Typography } from '../../components/typography';
import { FormInputError } from '../../components/inputs/form-input-error';
import { cacheKeys } from '../../utils/cache-keys';

const SettingsProfilePage = () => {
  const { user } = useOutletContext<SettingsPageOutletContext>();

  const { snackbar } = useSnackbar();

  const qc = useQueryClient();

  const { mutateAsync: updateProfile, isLoading } = useMutation(
    api.updateProfile,
    {
      onSuccess: () => {
        qc.invalidateQueries(cacheKeys.currentUserKey());
        qc.invalidateQueries(cacheKeys.userProfileKey(user.username));
      },
    },
  );

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<UpdateUserProfileDto>({
    resolver: classValidatorResolver(
      UpdateUserProfileDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  useEffect(() => {
    reset({
      name: user.name,
      username: user.username,
      bio: user.bio,
    });
  }, [user]);

  const submit = async (data: UpdateUserProfileDto) => {
    await updateProfile({
      id: user.id,
      ...data,
    });
    snackbar(PROFILE_UPDATE_SUCCESS);
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Typography size="title-lg">Edit Profie</Typography>
          <Stack>
            <label>Name</label>
            <Input placeholder="Name" {...register('name')} />
            <FormInputError error={errors.name} />
          </Stack>
          <Stack>
            <label>Username</label>
            <Input placeholder="Username" {...register('username')} />
            <FormInputError error={errors.username} />
          </Stack>
          <Textarea placeholder="Bio" {...register('bio')} rows={22} />
          <FormInputError error={errors.bio} />
          <Button type="submit" disabled={isLoading}>
            save
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default SettingsProfilePage;
