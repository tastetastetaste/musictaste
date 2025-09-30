import { IEntry, VoteType } from 'shared';
import { Group } from '../../components/flex/group';
import { User } from '../users/user';
import { RatingValue, UserRating } from '../ratings/rating';
import { Tooltip } from '../../components/popover/tooltip';
import {
  formatRelativeTime,
  formatRelativeTimeShort,
} from '../../utils/date-format';
import { Typography } from '../../components/typography';
import { Stack } from '../../components/flex/stack';
import { FlexChild } from '../../components/flex/flex-child';
import { FavIcon, LeastFavIcon } from './release-tracks';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../components/icon-button';
import { getReviewPathname } from '../../utils/get-pathname';
import { IconMusicHeart, IconNote } from '@tabler/icons-react';
import { useQuery } from 'react-query';
import { cacheKeys } from '../../utils/cache-keys';
import { api } from '../../utils/api';
import { Loading } from '../../components/loading';
import { useState } from 'react';
import { Popover } from '../../components/popover';
import styled from '@emotion/styled';

export const UserEntry = ({ entry }: { entry: IEntry }) => {
  return (
    <Group gap={10}>
      <User user={entry.user!} />
      <UserRating rating={entry.rating} />
      {entry.hasTrackVotes && <FavoriteTracksPopover entryId={entry.id} />}
      {!!entry.reviewId && <ReviewLink entryId={entry.id} />}
      <Tooltip content={`Added ${formatRelativeTime(entry.createdAt)}`}>
        <Typography>{formatRelativeTimeShort(entry.createdAt)}</Typography>
      </Tooltip>
    </Group>
  );
};

export const FollowingUserEntry = ({ entry }: { entry: IEntry }) => {
  return (
    <Stack gap={5} key={entry.id}>
      <User user={entry.user!} avatarOnly />
      {entry.rating && <UserRating rating={entry.rating} />}
      <Group gap={5}>
        {entry.reviewId && <ReviewLink entryId={entry.id} />}
        {entry.hasTrackVotes && <FavoriteTracksPopover entryId={entry.id} />}
      </Group>
    </Stack>
  );
};

export const UserEntryOnRelease = ({ entry }: { entry: IEntry }) => {
  return (
    <Group gap="sm">
      <UserRating rating={entry.rating} />
      {entry.hasTrackVotes && <FavoriteTracksPopover entryId={entry.id} />}
      {!!entry.reviewId && <ReviewLink entryId={entry.id} />}
      <Tooltip content={`Added ${formatRelativeTime(entry.createdAt)}`}>
        <Typography>{formatRelativeTimeShort(entry.createdAt)}</Typography>
      </Tooltip>
    </Group>
  );
};

export const ReviewLink: React.FC<{
  entryId: string;
}> = ({ entryId }) => {
  const navigate = useNavigate();
  return (
    <IconButton
      title="Review"
      onClick={() => {
        navigate(getReviewPathname(entryId));
      }}
    >
      <IconNote />
    </IconButton>
  );
};

const StyledFavIcon = styled(FavIcon)`
  color: ${({ theme }) => theme.colors.highlight};
`;

const StyledLeastFavIcon = styled(LeastFavIcon)`
  color: ${({ theme }) => theme.colors.highlight};
`;

export const FavoriteTracks = ({ entry }: { entry: IEntry }) => {
  const tracks = entry?.trackVotes;

  const upvotedTracks = tracks
    ?.filter((t) => t.vote === VoteType.UP)
    .sort((a, b) => a.track.order - b.track.order);
  const downvotedTracks = tracks
    ?.filter((t) => t.vote === VoteType.DOWN)
    .sort((a, b) => a.track.order - b.track.order);

  return (
    <Stack gap="md">
      {upvotedTracks && upvotedTracks.length > 0 && (
        <Group gap="sm" align="center">
          <FlexChild shrink={0}>
            <StyledFavIcon />
          </FlexChild>
          <Typography color="highlight">
            {upvotedTracks.map((t) => t.track.title).join(', ')}
          </Typography>
        </Group>
      )}

      {downvotedTracks && downvotedTracks.length > 0 && (
        <Group gap="sm" align="center">
          <FlexChild shrink={0}>
            <StyledLeastFavIcon />
          </FlexChild>
          <Typography color="highlight">
            {downvotedTracks.map((t) => t.track.title).join(', ')}
          </Typography>
        </Group>
      )}
    </Stack>
  );
};

const FavoriteTracksPopoverContent: React.FC<{ entryId: string }> = ({
  entryId,
}) => {
  const { data, isLoading } = useQuery(cacheKeys.entryKey(entryId), () =>
    api.getEntry(entryId),
  );

  return isLoading ? <Loading /> : <FavoriteTracks entry={data?.entry} />;
};

export const FavoriteTracksPopover: React.FC<{ entryId: string }> = ({
  entryId,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      content={<FavoriteTracksPopoverContent entryId={entryId} />}
    >
      <IconButton title="Favorite" onClick={() => setOpen(!open)}>
        <IconMusicHeart />
      </IconButton>
    </Popover>
  );
};
