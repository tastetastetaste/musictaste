import styled from '@emotion/styled';
import {
  IconBrandOpenSource,
  IconDatabasePlus,
  IconNote,
  IconPalette,
  IconPlaylistAdd,
  IconPlus,
  IconStar,
  IconTags,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/button';
import { Grid } from '../components/flex/grid';
import { Stack } from '../components/flex/stack';
import { Typography } from '../components/typography';

const Section = styled.div`
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 18px;
`;

const Card = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
`;

const IconBubble = styled.div`
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background_sub};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  & > svg {
    width: 20px;
    height: 20px;
  }
`;

const Cta = styled.div`
  margin-top: 6px;
`;

function FeaturesOverview() {
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
      icon: <IconUsersGroup />,
      title: 'Community',
      desc: 'Engage in real-time discussions, mention users, and receive notifications.',
    },
    {
      icon: <IconPalette />,
      title: 'Custom Themes',
      desc: 'Pick from multiple theme presets or customize all colors of the website to your liking.',
    },
    {
      icon: <IconDatabasePlus />,
      title: 'Contribute Music Data',
      desc: 'Add artists, labels, releases, and vote on genres.',
    },
    {
      icon: <IconBrandOpenSource />,
      title: 'Open Source',
      desc: 'Report bugs, request features, track issues, and join discussions on GitHub to help shape the future of the platform.',
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
        <Typography size="title-lg">Welcome to MusicTaste!</Typography>
        <Typography>
          MusicTaste is a social music platform that lets you rate, review, and
          make lists of music releases. Community-driven, open-source, and
          completely free.
        </Typography>

        <Grid cols={[1, 2]} gap={8}>
          {cards.map((c, idx) => (
            <Card key={idx}>
              <IconBubble aria-hidden>{c.icon}</IconBubble>
              <Stack gap="sm">
                <Typography size="title">{c.title}</Typography>
                <Typography>{c.desc}</Typography>
              </Stack>
            </Card>
          ))}
        </Grid>

        <Cta>
          <Button onClick={() => navigate('/login')} variant="highlight">
            Sign up / Login
          </Button>
        </Cta>
      </Stack>
    </Section>
  );
}

export default FeaturesOverview;
