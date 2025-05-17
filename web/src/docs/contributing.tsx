import { Container } from '../components/containers/container';
import { Markdown } from '../components/markdown';
import AppPageWrapper from '../layout/app-page-wrapper';
import { CONTRIBUTING_MD } from '../static/contributing';

const ContributingPage = () => {
  return (
    <AppPageWrapper title="about">
      <Container>
        <Markdown>{CONTRIBUTING_MD}</Markdown>
      </Container>
    </AppPageWrapper>
  );
};

export default ContributingPage;
