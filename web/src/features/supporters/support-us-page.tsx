import { useState } from 'react';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import Dialog from '../../components/dialog';
import { Stack } from '../../components/flex/stack';
import { Markdown } from '../../components/markdown';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { BUY_ME_A_COFFEE_LINK, KOFI_LINK } from '../../static/site-info';
import { Supporters } from '../users/supporters';

export const SUPPORT_US_MD = `# Thank you for considering supporting MusicTaste!

Your donation will allow us to put more time, effort, and resources into this project. You will also be making the website better for everyone!

As a supporter, you will get the following:
- Exclusive "Supporter" badge next to your name
- Personalize your public profile with your theme colors
- Use animated GIF images for your profile picture
- Filter charts by number of ratings
- More supporter only features as they are added

**One time donation = 1 year of supporter features**

Donations are made through our **Ko-fi** and **Buy Me a Coffee** pages.`;

const SupportUsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <AppPageWrapper title="support us" hideBackButton>
      <Container>
        <Stack gap="lg">
          <Stack>
            <Markdown>{SUPPORT_US_MD}</Markdown>
            <Button onClick={() => setOpenDialog(true)} variant="highlight">
              Donate
            </Button>
          </Stack>
          <Supporters />
        </Stack>
      </Container>
      <Dialog
        title="Support Us"
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <Stack gap="md">
          <Button
            onClick={() => window.open(KOFI_LINK, '_blank')}
            variant="highlight"
          >
            Ko-fi
          </Button>
          <Button
            onClick={() => window.open(BUY_ME_A_COFFEE_LINK, '_blank')}
            variant="highlight"
          >
            Buy Me a Coffee
          </Button>
        </Stack>
      </Dialog>
    </AppPageWrapper>
  );
};

export default SupportUsPage;
