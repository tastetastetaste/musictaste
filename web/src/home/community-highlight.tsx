import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../components/button';
import Dialog from '../components/dialog';
import { Stack } from '../components/flex/stack';
import { Markdown } from '../components/markdown';
import { Typography } from '../components/typography';
import { Release, ReleaseSmall } from '../features/releases/release';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { DISCORD_SERVER_INVITE } from '../static/site-info';
import { api } from '../utils/api';

const MD_HOW_THIS_WORKS = `Little-known albums, nominated, and voted on by the community to bring them more attention.

**Nominations**
Anyone who listens to the current community highlight can nominate an album for the following community highlight by commenting on [the community highlight list](/list/0QqHwYeHnvFo7).

**Voting**
Voting currently happens on our Discord server. [Join to vote](${DISCORD_SERVER_INVITE})`;

export const CommunityHighlight = () => {
  const { data: release, isLoading: isLoadingRelease } = useQuery(
    ['community-highlight'],
    () => api.getCommunityHighlight(),
  );

  const mdScreen = useMediaQuery({ down: 'lg' });

  const [opened, setOpened] = useState(false);

  if (!release) return null;

  return (
    <div
      css={(theme) => ({
        background: theme.colors.background_sub,
        padding: '16px',
        borderRadius: theme.border_radius.base,
      })}
    >
      <Stack gap="md" align="center">
        <Typography size="title">Community Highlight</Typography>
        {mdScreen ? (
          <ReleaseSmall release={release} />
        ) : (
          <Release release={release} />
        )}
        <Button onClick={() => setOpened(true)} variant="text">
          How this works?
        </Button>
        <Dialog
          title="Community Highlights"
          isOpen={opened}
          onClose={() => setOpened(false)}
        >
          <Markdown>{MD_HOW_THIS_WORKS}</Markdown>
        </Dialog>
      </Stack>
    </div>
  );
};
