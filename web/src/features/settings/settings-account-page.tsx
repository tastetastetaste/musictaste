import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { Input } from '../../components/inputs/input';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ON_USER_UPDATE_PASSWORD } from '../../static/feedback';
import { api } from '../../utils/api';
import { SettingsPageOutletContext } from './settings-page-wrapper';

const SettingsAccountPage = () => {
  const { user } = useOutletContext<SettingsPageOutletContext>();

  const { mutateAsync: updatePassword, isLoading } = useMutation(
    api.updatePassword,
  );

  const { handleSubmit, register, reset } = useForm({
    defaultValues: {
      newPassword: '',
      oldPassword: '',
    },
  });

  const { snackbar } = useSnackbar();

  const submit = async (data: any) => {
    await updatePassword({
      newPassword: data.newPassword,
      oldPassword: data.oldPassword,
      id: user.id,
    });

    snackbar(ON_USER_UPDATE_PASSWORD);
    reset();
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Typography size="title-lg">Update Password</Typography>
          <Input
            {...register('oldPassword')}
            type="password"
            placeholder="Old Password"
          />
          <Input
            {...register('newPassword')}
            type="password"
            placeholder="New Password"
          />
          <Button type="submit" disabled={isLoading}>
            Save
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default SettingsAccountPage;
