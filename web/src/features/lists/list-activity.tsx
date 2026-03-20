import { useState } from 'react';
import { CommentEntityType, IListResponse } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Group } from '../../components/flex/group';
import { Typography } from '../../components/typography';
import { IconButton } from '../../components/icon-button';
import { IconHeart, IconHeartFilled, IconMessage } from '@tabler/icons-react';
import { Comments } from '../comments/comments';
import Dialog from '../../components/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { User } from '../users/user';
import { Button } from '../../components/button';

const ListLikes = ({ id }: { id: string }) => {
  const { data } = useQuery(cacheKeys.listLikesKey(id), () =>
    api.getListLikes(id),
  );

  return (
    <Group wrap gap={10}>
      {data?.likes.map((user) => <User key={user.id} user={user} avatarOnly />)}
    </Group>
  );
};

const ListLikeButton = ({
  id,
  likedByMe,
  likesCount,
}: {
  id: string;
  likedByMe: boolean;
  likesCount: number;
}) => {
  const qc = useQueryClient();

  const { mutateAsync: createListLike } = useMutation(api.createListLike, {
    onSuccess: () => {
      qc.invalidateQueries(cacheKeys.listKey(id));
      qc.invalidateQueries(cacheKeys.listLikesKey(id));
    },
  });

  const { mutateAsync: removeListLike } = useMutation(api.removeListLike, {
    onSuccess: () => {
      qc.invalidateQueries(cacheKeys.listKey(id));
      qc.invalidateQueries(cacheKeys.listLikesKey(id));
    },
  });

  return (
    <IconButton
      title="Like"
      num={Number(likesCount) || 0}
      onClick={() => (likedByMe ? removeListLike(id) : createListLike(id))}
      active={likedByMe}
    >
      {likedByMe ? <IconHeartFilled /> : <IconHeart />}
    </IconButton>
  );
};

const ListActivityOnDesktop = ({
  list,
}: {
  list: Pick<
    IListResponse['list'],
    'id' | 'likesCount' | 'likedByMe' | 'commentsCount'
  >;
}) => {
  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Group justify="apart">
          <Typography size="title">Likes</Typography>
          <ListLikeButton
            likedByMe={list.likedByMe}
            likesCount={list.likesCount}
            id={list.id}
          />
        </Group>
        <ListLikes id={list.id} />
      </Stack>
      <Stack gap="sm">
        <Typography size="title">Comments</Typography>
        <Comments entityType={CommentEntityType.LIST} entityId={list.id} />
      </Stack>
    </Stack>
  );
};

const ListActivityOnMobile = ({
  list,
}: {
  list: Pick<
    IListResponse['list'],
    'id' | 'likesCount' | 'likedByMe' | 'commentsCount'
  >;
}) => {
  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <Stack gap="lg">
      <Group justify="apart" align="center">
        {list.likesCount > 0 ? (
          <Button variant="text" onClick={() => setShowLikes(true)}>
            {Number(list.likesCount) === 1
              ? `1 like`
              : `${list.likesCount} likes`}
          </Button>
        ) : (
          <div></div>
        )}
        <Group justify="end">
          <ListLikeButton
            likedByMe={list.likedByMe}
            likesCount={list.likesCount}
            id={list.id}
          />
          <IconButton
            title="Comments"
            num={Number(list.commentsCount) || 0}
            onClick={() => setShowComments(!showComments)}
            active={showComments}
          >
            <IconMessage />
          </IconButton>
        </Group>
      </Group>

      {showComments && (
        <Comments entityType={CommentEntityType.LIST} entityId={list.id} />
      )}

      <Dialog
        isOpen={showLikes}
        onClose={() => setShowLikes(false)}
        title="Likes"
      >
        <ListLikes id={list.id} />
      </Dialog>
    </Stack>
  );
};

export const ListActivity = ({
  isMobile,
  list,
}: {
  isMobile?: boolean;
  list: IListResponse['list'];
}) => {
  return isMobile ? (
    <ListActivityOnMobile list={list} />
  ) : (
    <ListActivityOnDesktop list={list} />
  );
};
