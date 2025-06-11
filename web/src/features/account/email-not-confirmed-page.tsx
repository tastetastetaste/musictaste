import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Markdown } from '../../components/markdown';
import { useAuth } from './useAuth';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { Container } from '../../components/containers/container';
import { CONTACT_EMAIL, SITE_NAME } from '../../static/site-info';

const message = `# Welcome to ${SITE_NAME}!
Thank you for signing up and becoming a member.

We have sent you an email with a link to confirm your email and activate your account. Please check your inbox (and spam folder).

If you don't receive the confirmation email, need help or support, or have any questions, please contact us at: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). 
`;

const EmailNotConfirmedPage = () => {
  const { me } = useAuth();

  const navigate = useNavigate();
  useEffect(() => {
    if (me && me.confirmed) {
      navigate('/', { replace: true });
    }
  }, [me, navigate]);

  return (
    <AppPageWrapper title="Confirm your email">
      <Container>
        <Markdown>{message}</Markdown>
      </Container>
    </AppPageWrapper>
  );
};

export default EmailNotConfirmedPage;
