import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginDto, SignupDto } from 'shared';
import { api } from '../../utils/api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { Stack } from '../../components/flex/stack';
import { Link } from '../../components/links/link';
import { Input } from '../../components/inputs/input';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { FormInputError } from '../../components/inputs/form-input-error';

const Login = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(api.login, {
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: classValidatorResolver(
      LoginDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  const submit = async (data: LoginDto) => {
    const loginSuccess = await mutateAsync(data);

    if (loginSuccess) {
      navigate('/', { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="md">
        <Typography size="title-lg">Log In</Typography>
        <Input type="email" placeholder="Email" {...register('email')} />
        <FormInputError error={errors.email} />
        <Input
          placeholder="Password"
          type="password"
          {...register('password')}
        />
        <FormInputError error={errors.password} />
        <Button type="submit" disabled={isLoading}>
          Login
        </Button>
        <Group justify="end">
          <Link to="/account/password/reset">Forgot password?</Link>
        </Group>
      </Stack>
    </form>
  );
};

const Signup = () => {
  const [signupSuccessful, setSignupSuccessful] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(api.signup, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignupDto>({
    resolver: classValidatorResolver(
      SignupDto,
      {},
      {
        rawValues: true,
      },
    ),
  });

  const submit = async (data: SignupDto) => {
    const signupSuccess = await mutateAsync(data);

    if (signupSuccess) {
      setSignupSuccessful(true);
    }
  };

  return signupSuccessful ? (
    <Group justify="center">
      <span>Sign-up successful. Please login!</span>
    </Group>
  ) : (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="md">
        <Typography size="title-lg">Sign Up</Typography>
        <Input placeholder="Username" {...register('username')} />
        <FormInputError error={errors.username} />
        <Input type="email" placeholder="Email" {...register('email')} />
        <Input
          type="password"
          placeholder="Password"
          {...register('password')}
        />
        <FormInputError error={errors.password} />
        <Button type="submit" disabled={isLoading}>
          Signup
        </Button>
      </Stack>
    </form>
  );
};

const LoginPage = () => {
  return (
    <AppPageWrapper title="Login">
      <ResponsiveRow breakpoint="md" gap="lg">
        <FlexChild grow shrink>
          <Login />
        </FlexChild>
        <FlexChild grow shrink>
          <Signup />
        </FlexChild>
      </ResponsiveRow>
    </AppPageWrapper>
  );
};

export default LoginPage;
