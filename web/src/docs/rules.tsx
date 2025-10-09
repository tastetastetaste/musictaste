import { Container } from '../components/containers/container';
import { Markdown } from '../components/markdown';
import { Stack } from '../components/flex/stack';
import AppPageWrapper from '../layout/app-page-wrapper';
import { RULES_MD } from '../static/rules';

const RulesPage = () => {
  return (
    <AppPageWrapper title="rules">
      <Container>
        <Stack gap="lg">
          <Markdown>{RULES_MD}</Markdown>
        </Stack>
      </Container>
    </AppPageWrapper>
  );
};

export default RulesPage;
