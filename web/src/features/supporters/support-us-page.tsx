import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { Markdown } from '../../components/markdown';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { KOFI_LINK } from '../../static/site-info';
import { Supporters } from '../users/supporters';

export const SUPPORT_US_MD = `# Thank you for considering supporting MusicTaste!

Your donation will allow us to put more time, effort, and resources into this project. You will also be making the website better for everyone!

You will get the following for one year:
- Supporter badge
- Custom profile theme colors
- Filter charts by minimum and maximum number of ratings
- More supporter only features as they are added

Donations are made through our Ko-fi page`;

const SupportUsPage = () => {
  return (
    <AppPageWrapper title="support us">
      <Container>
        <Stack gap="lg">
          <Stack>
            <Markdown>{SUPPORT_US_MD}</Markdown>
            <Button
              onClick={() => window.open(KOFI_LINK, '_blank')}
              variant="highlight"
            >
              Donate
            </Button>
          </Stack>
          <Supporters />
        </Stack>
      </Container>
    </AppPageWrapper>
  );
};

export default SupportUsPage;
