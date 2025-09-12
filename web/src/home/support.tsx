import styled from '@emotion/styled';
import {
  IconBrandOpenSource,
  IconDatabasePlus,
  IconNote,
  IconPalette,
  IconPlaylistAdd,
  IconPlus,
  IconShieldCheck,
  IconStar,
  IconTags,
  IconUsers,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/button';
import { Grid } from '../components/flex/grid';
import { Stack } from '../components/flex/stack';
import { Typography } from '../components/typography';
import { Container } from '../components/containers/container';
import { KOFI_LINK } from '../static/site-info';

const Section = styled.div`
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 18px;
  margin-top: 48px;
  margin-bottom: 24px;
`;

const Cta = styled.div`
  margin-top: 6px;
`;

function Support() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <IconStar />,
      title: 'Ratings',
      desc: 'Rate your music using a flexible 0.0-10 rating scale, and select favorite and least favorite tracks with each release you rate',
    },
    {
      icon: <IconNote />,
      title: 'Reviews',
      desc: 'Write music reviews, and upvote reviews you find insightful or helpful.',
    },
    {
      icon: <IconPlaylistAdd />,
      title: 'Lists',
      desc: 'Create lists of music releases and share them with your friends and the community.',
    },
    {
      icon: <IconTags />,
      title: 'Personal tags',
      desc: 'Create and apply tags to releases, and use them to filter your music.',
    },
    {
      icon: <IconUsers />,
      title: 'Follow Users',
      desc: 'Follow people and see their activity on release pages.',
    },
    {
      icon: <IconDatabasePlus />,
      title: 'Contribute Music Data',
      desc: 'Add artists, labels, releases, and vote on genres.',
    },
    {
      icon: <IconPalette />,
      title: 'Custom Themes',
      desc: 'Pick from multiple theme presets or customize all colors of the website to your liking.',
    },
    {
      icon: <IconBrandOpenSource />,
      title: 'Open Source',
      desc: 'Report bugs, request features, track issues, and join discussions on GitHub to help shape the future of the platform.',
    },
    {
      icon: <IconShieldCheck />,
      title: 'No Ads or Tracking',
      desc: 'Enjoy a clean, privacy‑respecting experience.',
    },
    {
      icon: <IconPlus />,
      title: 'And much more',
      desc: 'Create an account to explore everything MusicTaste has to offer.',
    },
  ];

  return (
    <Section>
      <Stack gap="md">
        <Typography size="title">
          Help support our efforts in developing and maintaining MusicTaste by
          donating on ko-fi.
        </Typography>
        <Cta>
          <Button
            onClick={() => window.open(KOFI_LINK, '_blank')}
            variant="highlight"
          >
            Donate
          </Button>
        </Cta>
      </Stack>
    </Section>
  );
}

export default Support;
