import styled from '@emotion/styled';
import { IconThumbDownFilled, IconThumbUpFilled } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ITrackWithVotes, VoteType } from 'shared';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Typography } from '../../components/typography';
import { useAuth } from '../account/useAuth';
import { millisecondsToTimeString } from '../contributions/release-tracks-fields';
import { useReleaseActions } from './release-actions/useReleaseActions';
import dayjs from 'dayjs';

export const FavIcon = IconThumbUpFilled;
export const LeastFavIcon = IconThumbDownFilled;

const StyledTrack = styled.div<{ alt: boolean }>`
  display: flex;
  width: 100%;
  background: ${({ theme, alt }) =>
    alt ? theme.colors.complement : theme.colors.base};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  gap: 12px;
`;

type TrackWithMyVote = ITrackWithVotes & {
  vote: VoteType;
};

const ReleaseTracks: React.FC<{
  releaseId: string;
  date: string;
  releaseTracks: ITrackWithVotes[];
}> = ({ releaseId, releaseTracks, date }) => {
  const { isLoggedIn } = useAuth();
  const { entry, createEntry, trackVote, removeTrackVote, createEntryLoading } =
    useReleaseActions(releaseId);

  const [tracks, setTrack] = useState<TrackWithMyVote[]>();
  const isUnreleased = dayjs(date).isAfter(dayjs());

  useEffect(() => {
    const _tracks = releaseTracks.map((t) => {
      const vote = entry?.trackVotes?.find((vote) => vote.trackId === t.id);

      return {
        ...t,
        vote: vote?.vote,
      };
    });

    setTrack(_tracks);
  }, [entry, releaseTracks]);

  const clickFu: (type: VoteType, track: TrackWithMyVote) => void = async (
    type,
    track,
  ) => {
    if (!entry) {
      await createEntry();
    }

    if (track.vote) {
      removeTrackVote({
        releaseId,
        trackId: track.id,
      });
    } else {
      trackVote(
        {
          releaseId,
          trackId: track.id,
          vote: type,
        },
        {
          onSettled: (data) => {
            console.log(data);
          },
        },
      );
    }
  };

  return (
    <div
      css={{
        width: '360px',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack gap="sm">
        <Stack>
          {tracks &&
            tracks.map((t, i) => (
              <StyledTrack key={t.id} alt={i % 2 === 0}>
                <Group justify="apart">
                  <Group gap="sm">
                    <Typography color="sub" whiteSpace="nowrap">
                      {t.track}
                    </Typography>
                    <Typography>{t.title}</Typography>
                  </Group>
                  <Typography color="sub" whiteSpace="nowrap">
                    {t.durationMs ? millisecondsToTimeString(t.durationMs) : ''}
                  </Typography>
                </Group>
                {!isUnreleased && (
                  <Group justify="end" gap="sm">
                    {isLoggedIn && (
                      <IconButton
                        title="Favorite"
                        active={t.vote === VoteType.UP}
                        onClick={() => clickFu(VoteType.UP, t)}
                        disabled={createEntryLoading}
                      >
                        <FavIcon />
                      </IconButton>
                    )}
                    <Typography whiteSpace="nowrap">
                      {Number(t.upvotes) - Number(t.downvotes) > 0
                        ? `+${Number(t.upvotes) - Number(t.downvotes)}`
                        : Number(t.upvotes) - Number(t.downvotes)}
                    </Typography>
                    {isLoggedIn && (
                      <IconButton
                        title="Least Favorite"
                        active={t.vote === VoteType.DOWN}
                        onClick={() => clickFu(VoteType.DOWN, t)}
                        disabled={createEntryLoading}
                      >
                        <LeastFavIcon />
                      </IconButton>
                    )}
                  </Group>
                )}
              </StyledTrack>
            ))}
        </Stack>
      </Stack>
    </div>
  );
};

export default ReleaseTracks;
