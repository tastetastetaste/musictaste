import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '../utils/cache-keys';
import { api } from '../utils/api';
import { Release, ReleaseSmall } from '../features/releases/release';
import { Typography } from '../components/typography';
import { Stack } from '../components/flex/stack';
import Dialog from '../components/dialog';
import { useState } from 'react';
import { Button } from '../components/button';
import { DISCORD_SERVER_INVITE } from '../static/site-info';
import { Markdown } from '../components/markdown';
import { FlexChild } from '../components/flex/flex-child';

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

  const [opened, setOpened] = useState(false);

  if (!release) return null;

  return (
    <Stack gap="md" align="start">
      <Typography size="title-lg">Community Highlight</Typography>
      <ReleaseSmall release={release} />
      <FlexChild align="center">
        <Button onClick={() => setOpened(true)} variant="text">
          How this works?
        </Button>
      </FlexChild>
      <Dialog
        title="Community Highlights"
        isOpen={opened}
        onClose={() => setOpened(false)}
      >
        <Markdown>{MD_HOW_THIS_WORKS}</Markdown>
      </Dialog>
    </Stack>
  );
};
