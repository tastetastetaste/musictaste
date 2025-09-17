import styled from '@emotion/styled';
import { IconThumbDownFilled, IconThumbUpFilled } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ITrackWithVotes, VoteType } from 'shared';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Typography } from '../../components/typography';
import { useAuth } from '../account/useAuth';
import {
  millisecondsToTimeString,
  millisecondsToTimeStringFull,
} from '../contributions/release-tracks-fields';
import { useReleaseActions } from './release-actions/useReleaseActions';
import dayjs from 'dayjs';
import { FlexChild } from '../../components/flex/flex-child';
import Color from 'color';
import { Tooltip } from '../../components/popover/tooltip';
export const FavIcon = IconThumbUpFilled;
export const LeastFavIcon = IconThumbDownFilled;

const StyledTrack = styled.div<{ alt: boolean; upvotesRatio?: number }>`
  display: flex;
  width: 100%;
  background: ${({ theme, alt, upvotesRatio }) =>
    typeof upvotesRatio === 'number'
      ? `linear-gradient(90deg, ${Color(
          alt ? theme.colors.background_sub : theme.colors.background,
        )
          .alpha(1)
          .rgb()
          .toString()} ${upvotesRatio - 2}%, ${Color(theme.colors.error).alpha(0.3).rgb().toString()} ${upvotesRatio + 2}%)`
      : alt
        ? theme.colors.background_sub
        : theme.colors.background};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  gap: 12px;
`;

const DurationContainer = styled.div`
  padding: 8px 16px;
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
              <StyledTrack
                key={t.id}
                alt={i % 2 === 0}
                upvotesRatio={
                  (Number(t.upvotes) /
                    (Number(t.upvotes) + Number(t.downvotes))) *
                  100
                }
              >
                {/* track number fixed width */}
                <FlexChild basis="20px">
                  <Typography color="sub" whiteSpace="nowrap">
                    {t.track}
                  </Typography>
                </FlexChild>
                {/* track title flex grow and shrink */}
                <FlexChild grow={1} shrink={1}>
                  <Typography>{t.title}</Typography>
                </FlexChild>
                {/* track duration fixed width */}
                <FlexChild basis="40px">
                  <Typography color="sub" whiteSpace="nowrap">
                    {t.durationMs ? millisecondsToTimeString(t.durationMs) : ''}
                  </Typography>
                </FlexChild>
                {/* track reactions fixed width */}
                {!isUnreleased && (
                  <FlexChild basis={isLoggedIn ? '80px' : '40px'}>
                    <Group justify="apart">
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
                      <Tooltip
                        content={`${t.upvotes} upvotes - ${t.downvotes} downvotes`}
                      >
                        <Typography whiteSpace="nowrap" size="body-bold">
                          {Number(t.upvotes) - Number(t.downvotes) > 0
                            ? `+${Number(t.upvotes) - Number(t.downvotes)}`
                            : Number(t.upvotes) - Number(t.downvotes)}
                        </Typography>
                      </Tooltip>

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
                  </FlexChild>
                )}
              </StyledTrack>
            ))}

          {tracks?.length > 0 && (
            <Group justify="end">
              <DurationContainer>
                <Typography color="sub">
                  {tracks.length} track{tracks.length !== 1 ? 's' : ''}
                  {tracks && tracks.every((t) => t.durationMs)
                    ? ', ' +
                      millisecondsToTimeStringFull(
                        tracks?.reduce((acc, t) => acc + t.durationMs, 0),
                      )
                    : ''}
                </Typography>
              </DurationContainer>
            </Group>
          )}
        </Stack>
      </Stack>
    </div>
  );
};

export default ReleaseTracks;
