import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconFlagFilled,
  IconTrash,
  IconArrowBackUp,
} from '@tabler/icons-react';
import { ContributorStatus, IComment, SupporterStatus } from 'shared';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { CardLink } from '../../components/links/card-link';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { formatRelativeTimeShort } from '../../utils/date-format';
import { getUserPath } from 'shared';
import { Avatar } from '../users/avatar';
import { SupporterBadge } from '../../components/badge/supporter-badge';
import { Markdown } from '../../components/markdown';
import { TrustedContributorBadge } from '../../components/badge/trusted-contributor-badge';

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
  onReply?: () => void | null;
}

export function Comment({
  comment: { user, body, createdAt },
  onReport,
  onRemove,
  onReply,
}: CommentProps) {
  return (
    <Container>
      <Group gap="md" align="center">
        <div css={{ alignSelf: 'flex-start' }}>
          <CardLink to={getUserPath({ username: user.username })}>
            <Avatar src={user.image?.sm} alt={user.username} />
          </CardLink>
        </div>
        <FlexChild grow>
          <Stack gap="sm">
            <Group gap="sm" align="center">
              <Link
                to={getUserPath({ username: user.username })}
                highlight={user.supporter === SupporterStatus.SUPPORTER}
              >
                {user.name}
              </Link>
              <Typography color="sub" size="small">
                @{user.username}
              </Typography>
              {user.contributorStatus ===
              ContributorStatus.TRUSTED_CONTRIBUTOR ? (
                <TrustedContributorBadge size="sm" />
              ) : null}
              {user.supporter >= SupporterStatus.SUPPORTER ? (
                <SupporterBadge size="sm" />
              ) : null}
              {onReply && (
                <IconButton onClick={onReply} title="Reply">
                  <IconArrowBackUp size={16} />
                </IconButton>
              )}
            </Group>
            <Markdown variant="compact">{body}</Markdown>
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
