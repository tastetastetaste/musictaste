import styled from '@emotion/styled';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { BUY_ME_A_COFFEE_LINK, KOFI_LINK } from '../../static/site-info';
import { Supporters } from '../users/supporters';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 18px;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
`;

const PerksList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SupportUsPage = () => {
  return (
    <AppPageWrapper title="support us" hideBackButton>
      <Container>
        <Stack gap="lg">
          <Stack gap="md">
            <Typography size="title-lg">
              Thank you for considering supporting MusicTaste!
            </Typography>

            <Typography>
              Your donations directly contribute to the well-being and the
              future of this project. If you value what we're building and want
              to see it grow, a donation is a great way to help.
            </Typography>

            <Typography>
              One-time donation gives you 1 year of supporter features. You can
              choose the amount you wish to donate.
            </Typography>
          </Stack>

          <Stack gap="md">
            <Typography size="title">Supporter perks</Typography>
            <PerksList>
              <li>
                <Typography>
                  Exclusive "Supporter" badge next to your name
                </Typography>
              </li>
              <li>
                <Typography>
                  Personalize your public profile with your theme colors
                </Typography>
              </li>
              <li>
                <Typography>
                  Use animated GIF images for your profile picture
                </Typography>
              </li>
              <li>
                <Typography>Filter charts by number of ratings</Typography>
              </li>
              <li>
                <Typography>
                  Unlock up to 10 collection views to better organize your
                  collection
                </Typography>
              </li>
              <li>
                <Typography>
                  More supporter-only features as they are added
                </Typography>
              </li>
            </PerksList>
          </Stack>

          <Stack gap="md">
            <Typography size="title">Ways to donate</Typography>
            <Group align="stretch" gap="md">
              <Card>
                <Stack gap="sm">
                  <Typography size="title">PayPal</Typography>
                  <Typography>
                    Make a one-time donation via our Ko-fi page using PayPal
                  </Typography>
                </Stack>
                <Button
                  onClick={() => window.open(KOFI_LINK, '_blank')}
                  variant="highlight"
                >
                  Continue to Ko-fi
                </Button>
              </Card>
              <Card>
                <Stack gap="sm">
                  <Typography size="title">Credit / Debit Card</Typography>
                  <Typography>
                    Make a one-time donation via our Buy Me a Coffee page using
                    credit or debit card
                  </Typography>
                </Stack>
                <Button
                  onClick={() => window.open(BUY_ME_A_COFFEE_LINK, '_blank')}
                  variant="highlight"
                >
                  Continue to BMC
                </Button>
              </Card>
            </Group>
          </Stack>
          <Supporters />
        </Stack>
      </Container>
    </AppPageWrapper>
  );
};

export default SupportUsPage;
