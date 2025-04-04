import { api } from '../../utils/api';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { Input } from '../../components/inputs/input';
import AppPageWrapper from '../../layout/app-page-wrapper';

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);

  const { mutateAsync: sendForgotPasswordEmail, isLoading } = useMutation(
    api.forgotPassword,
  );

  const { handleSubmit, register } = useForm();

  const submit = async (data: any) => {
    const success = await sendForgotPasswordEmail(data.email);
    if (success) {
      setEmailSent(data.email);
    }
  };

  return (
    <AppPageWrapper title={emailSent ? 'Email sent!' : 'Forgot password?'}>
      <Container>
        {emailSent ? (
          <span>
            We have sent an email to &apos;{emailSent}&apos; so that you can
            reset your password.
          </span>
        ) : (
          <Fragment>
            <span>
              Enter your email address, and we&apos;ll send you a link to reset
              your password
            </span>

            <form onSubmit={handleSubmit(submit)}>
              <Stack gap="sm">
                <Input
                  placeholder="Email"
                  {...register('email', { required: true })}
                />
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
              </Stack>
            </form>
          </Fragment>
        )}
      </Container>
    </AppPageWrapper>
  );
};

export default ForgotPasswordPage;
