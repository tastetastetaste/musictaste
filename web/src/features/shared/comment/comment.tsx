import styled from '@emotion/styled';
import { IListComment, IReviewComment } from 'shared';
import { Group } from '../../../components/flex/group';
import { Markdown } from '../../../components/markdown';
import { Typography } from '../../../components/typography';
import { formatRelativeTimeShort } from '../../../utils/date-format';
import { User } from '../../users/user';
import { keyframes } from '@emotion/react';

const Fade = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`;

const Container = styled.div`
  margin-top: 10px;
  animation: ${Fade} 1s ease-out 0s;
`;

export interface CommentProps {
  comment: IReviewComment | IListComment;
}

export function Comment({ comment: { user, body, createdAt } }: CommentProps) {
  return (
    <Container>
      <div
        css={{
          padding: '0 10px',
        }}
      >
        <Group justify="apart">
          <User user={user} />
          <Typography size="small">
            {formatRelativeTimeShort(createdAt)}
          </Typography>
        </Group>
      </div>
      <div css={{ margin: '10px 64px 30px' }}>
        <Markdown>{body}</Markdown>
      </div>
    </Container>
  );
}

export default Comment;
