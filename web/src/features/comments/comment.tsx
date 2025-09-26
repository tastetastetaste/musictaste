import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { IconFlagFilled, IconTrash } from '@tabler/icons-react';
import { IComment } from 'shared';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { CardLink } from '../../components/links/card-link';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { formatRelativeTimeShort } from '../../utils/date-format';
import { getUserPathname } from '../../utils/get-pathname';
import { Avatar } from '../users/avatar';

const Fade = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`;

const Container = styled.div`
  animation: ${Fade} 1s ease-out 0s;
`;

export interface CommentProps {
  comment: IComment;
  onReport: () => void | null;
  onRemove?: () => void | null;
}

export function Comment({
  comment: { user, body, createdAt },
  onReport,
  onRemove,
}: CommentProps) {
  return (
    <Container>
      <Group gap="md" align="center">
        <div css={{ alignSelf: 'flex-start' }}>
          <CardLink to={getUserPathname(user.username)}>
            <Avatar src={user.image?.sm} alt={user.username} />
          </CardLink>
        </div>
        <FlexChild grow>
          <Stack gap="sm">
            <Group gap="sm">
              <Link to={getUserPathname(user.username)}>{user.name}</Link>
              <Typography color="sub" size="small">
                @{user.username}
              </Typography>
            </Group>
            <Typography whiteSpace="pre-wrap">{body}</Typography>
          </Stack>
        </FlexChild>
        <Typography size="small">
          {formatRelativeTimeShort(createdAt)}
        </Typography>
        {onRemove ? (
          <IconButton onClick={onRemove} title="Remove">
            <IconTrash size={16} />
          </IconButton>
        ) : onReport ? (
          <IconButton onClick={onReport} title="Report">
            <IconFlagFilled size={16} />
          </IconButton>
        ) : null}
      </Group>
    </Container>
  );
}

export default Comment;
