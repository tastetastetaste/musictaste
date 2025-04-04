import { IUser } from 'shared';
import { getUserPathname } from '../../utils/get-pathname';
import { Avatar } from './avatar';
import { CardLink } from '../../components/links/card-link';
import { Group } from '../../components/flex/group';
import { Link } from '../../components/links/link';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';

interface IUserItemProps {
  user: IUser;
  avatarOnly?: boolean;
  isLarge?: boolean;
}

export const User: React.FC<IUserItemProps> = ({
  user: { username, name, image },
  avatarOnly = false,
  isLarge = false,
}) => {
  const userAvatar = isLarge ? (
    <CardLink to={getUserPathname(username)}>
      <img
        width="170px"
        height="170px"
        src={image?.md || '/placeholder.jpg'}
        alt={username}
        style={{
          borderRadius: '50%',
          height: '170px',
          width: '170px',
        }}
      />
    </CardLink>
  ) : (
    <CardLink to={getUserPathname(username)}>
      <Avatar src={image?.sm} alt={username} />
    </CardLink>
  );

  if (avatarOnly) return userAvatar;

  return isLarge ? (
    <Stack align="center" justify="center">
      {userAvatar}
      <Link to={getUserPathname(username)} size="title">
        {name}
      </Link>
      <Typography color="sub">@{username}</Typography>
    </Stack>
  ) : (
    <Group gap="sm">
      {userAvatar}
      <Stack>
        <Link to={getUserPathname(username)}>{name}</Link>
        <Typography color="sub" size="small">
          @{username}
        </Typography>
      </Stack>
    </Group>
  );
};
