import { ContributorStatus, IUserSummary, SupporterStatus } from 'shared';
import { getUserPath } from 'shared';
import { Avatar } from './avatar';
import { CardLink } from '../../components/links/card-link';
import { Group } from '../../components/flex/group';
import { Link } from '../../components/links/link';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { SupporterBadge } from '../../components/badge/supporter-badge';
import { TrustedContributorBadge } from '../../components/badge/trusted-contributor-badge';

interface IUserItemProps {
  user: IUserSummary;
  avatarOnly?: boolean;
  isLarge?: boolean;
}

export const User: React.FC<IUserItemProps> = ({
  user: { username, name, image, supporter, contributorStatus },
  avatarOnly = false,
  isLarge = false,
}) => {
  const userAvatar = isLarge ? (
    <CardLink to={getUserPath({ username })}>
      <img
        width="170px"
        height="170px"
        src={image?.md || '/placeholder/md.jpeg'}
        alt={username}
        style={{
          borderRadius: '50%',
          height: '170px',
          width: '170px',
        }}
      />
    </CardLink>
  ) : (
    <CardLink to={getUserPath({ username })}>
      <Avatar src={image?.sm} alt={username} />
    </CardLink>
  );

  if (avatarOnly) return userAvatar;

  const isSupporter = supporter >= SupporterStatus.SUPPORTER;
  const isTrusted = contributorStatus === ContributorStatus.TRUSTED_CONTRIBUTOR;

  return isLarge ? (
    <Stack align="center" justify="center" gap="md">
      {userAvatar}
      <Link to={getUserPath({ username })} size="title">
        {name}
      </Link>
      <Typography color="sub">@{username}</Typography>
      {isTrusted ? <TrustedContributorBadge size="md" /> : null}
      {isSupporter ? <SupporterBadge size="md" /> : null}
    </Stack>
  ) : (
    <Group gap="md" wrap>
      {userAvatar}
      <Stack gap="sm">
        <Link to={getUserPath({ username })}>{name}</Link>
        <Typography color="sub" size="small">
          @{username}
        </Typography>
      </Stack>
      {isTrusted ? <TrustedContributorBadge size="md" /> : null}
      {isSupporter ? <SupporterBadge size="md" /> : null}
    </Group>
  );
};
