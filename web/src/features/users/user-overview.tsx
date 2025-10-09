import {
  IconUserCheck,
  IconUserMinus,
  IconUserPlus,
} from '@tabler/icons-react';
import { AccountStatus, IUserProfileResponse, SupporterStatus } from 'shared';
import { api } from '../../utils/api';
import { useMutation, useQueryClient } from 'react-query';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Navigation } from '../../components/nav';
import { useAuth } from '../account/useAuth';
import { useHover } from '../../hooks/useHover';
import { Typography } from '../../components/typography';
import { getUserPath } from 'shared';
import { cacheKeys } from '../../utils/cache-keys';
import { SupporterBadge } from '../../components/badge/supporter-badge';

const FollowAction = ({
  userId,
  username,
  following,
}: {
  userId: string;
  username: string;
  following: boolean;
}) => {
  const qc = useQueryClient();
  const { me } = useAuth();

  const refetchQueries = () => {
    qc.refetchQueries(cacheKeys.userProfileKey(username));
    qc.refetchQueries(cacheKeys.currentUserKey());
    qc.invalidateQueries(cacheKeys.userFollowingKey(me.id));
    qc.invalidateQueries(cacheKeys.userFollowersKey(userId));
  };

  const [hoverRef, isHovered] = useHover();

  const { mutateAsync: unfollowMu, isLoading: isLoading2 } = useMutation(
    () => api.unFollow({ id: userId }),
    {
      onSettled: refetchQueries,
    },
  );

  const { mutateAsync: followMu, isLoading } = useMutation(
    () => api.follow({ id: userId }),
    {
      onSettled: refetchQueries,
    },
  );

  const followAction = async () => {
    await followMu();
  };

  const unFollowAction = async () => {
    await unfollowMu();
  };

  return following ? (
    <IconButton
      variant="solid"
      title="Unfollow"
      onClick={unFollowAction}
      disabled={isLoading2}
      active
      ref={hoverRef}
      danger={isHovered}
    >
      {isHovered ? <IconUserMinus /> : <IconUserCheck />}
    </IconButton>
  ) : (
    <IconButton
      variant="solid"
      title="Follow"
      onClick={followAction}
      disabled={isLoading}
    >
      <IconUserPlus />
    </IconButton>
  );
};

const ImageSize = 230;

interface OverviewSectionProps {
  user: IUserProfileResponse;
  isUserMyself: boolean;
  accountStatus: AccountStatus;
}

export const UserOverview: React.FC<OverviewSectionProps> = ({
  user: {
    following,
    followedBy,
    user: { id, username, name, image, supporter, contributorStatus },
    stats: {
      entriesCount,
      followersCount,
      followingCount,
      listsCount,
      // ratingsCount,
      reviewsCount,
    },
  },
  isUserMyself,
  accountStatus,
}) => {
  const { isLoggedIn } = useAuth();
  return (
    <Stack align="center" justify="center" gap={10}>
      <Group wrap gap={10}>
        {image ? (
          <img
            width={ImageSize}
            height={ImageSize}
            src={image.md}
            alt={username}
            style={{
              borderRadius: '50%',
              height: ImageSize,
              width: ImageSize,
            }}
          />
        ) : (
          <img
            width={ImageSize}
            height={ImageSize}
            src="/placeholder/md.jpeg"
            alt={username}
            style={{
              borderRadius: '50%',

              height: ImageSize,
              width: ImageSize,
            }}
          />
        )}
        <Stack gap="lg" align="start">
          <Stack>
            <Typography size="title-xl">{name}</Typography>
            <Typography>@{username}</Typography>
          </Stack>
          <Group gap="md" wrap>
            {supporter === SupporterStatus.SUPPORTER ? (
              <SupporterBadge size="lg" />
            ) : null}
          </Group>
          {accountStatus !== AccountStatus.DELETED &&
          accountStatus !== AccountStatus.BANNED &&
          isLoggedIn &&
          !isUserMyself ? (
            <Group align="center">
              <FollowAction
                userId={id}
                username={username}
                following={following}
              />
            </Group>
          ) : null}
          {followedBy && <Typography>Follows you</Typography>}
        </Stack>
      </Group>
      {accountStatus !== AccountStatus.DELETED &&
        accountStatus !== AccountStatus.BANNED && (
          <Navigation
            links={[
              {
                to: `${getUserPath({ username })}`,
                asPath: '/[username]',
                label: 'Profile',
              },
              {
                to: `${getUserPath({ username })}/music`,
                asPath: '/[username]/music',
                label: 'Music',
                count: entriesCount || undefined,
              },
              {
                to: `${getUserPath({ username })}/reviews`,
                asPath: '/[username]/reviews',
                label: 'Reviews',
                count: reviewsCount || undefined,
              },
              {
                to: `${getUserPath({ username })}/lists`,
                asPath: '/[username]/lists',
                label: 'Lists',
                count: listsCount || undefined,
              },
              {
                to: `${getUserPath({ username })}/followers`,
                asPath: '/[username]/followers',
                label: 'Followers',
                count: followersCount || undefined,
              },
              {
                to: `${getUserPath({ username })}/following`,
                asPath: '/[username]/following',
                label: 'Following',
                count: followingCount || undefined,
              },
            ]}
          />
        )}
    </Stack>
  );
};
