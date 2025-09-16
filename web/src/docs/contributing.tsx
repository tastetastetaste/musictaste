import { Container } from '../components/containers/container';
import { Markdown } from '../components/markdown';
import { TrustedContributors } from '../features/users/trusted-contributors';
import { Stack } from '../components/flex/stack';
import AppPageWrapper from '../layout/app-page-wrapper';
import { CONTRIBUTING_MD } from '../static/contributing';

const ContributingPage = () => {
  return (
    <AppPageWrapper title="about">
      <Container>
        <Stack gap="lg">
          <Markdown>{CONTRIBUTING_MD}</Markdown>
          <TrustedContributors />
        </Stack>
      </Container>
    </AppPageWrapper>
  );
};

export default ContributingPage;
