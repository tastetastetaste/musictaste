import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { Input } from '../../components/inputs/input';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { ON_USER_RESET_PASSWORD } from '../../static/feedback';
import { api } from '../../utils/api';

const ResetPasswordPage = () => {
  const { snackbar } = useSnackbar();

  const navigate = useNavigate();

  const { token } = useParams();

  const { mutateAsync: changePassword, isLoading } = useMutation(
    api.forgotPasswordChange,
  );

  const { handleSubmit, register } = useForm();

  const qc = useQueryClient();

  const submit = async (data: any) => {
    const success = await changePassword({
      token: token!,
      newPassword: data.password,
    });

    qc.invalidateQueries();

    if (success) {
      snackbar(ON_USER_RESET_PASSWORD);

      navigate('/login', { replace: true });
    }
  };

  return (
    <AppPageWrapper title="Pick a new password">
      <Container>
        <form onSubmit={handleSubmit(submit)}>
          <Stack gap="sm">
            <Input
              {...register('password', { required: true })}
              placeholder="New password"
            />
            <Button type="submit" disabled={isLoading}>
              Save
            </Button>
          </Stack>
        </form>
      </Container>
    </AppPageWrapper>
  );
};

export default ResetPasswordPage;
