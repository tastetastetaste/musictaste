import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { CommentEntityType, FindCommentsDto, ReportType } from 'shared';
import { Button } from '../../components/button';
import { Feedback } from '../../components/feedback';
import { FetchMoreOnClick } from '../../components/fetch-more';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Textarea } from '../../components/inputs/textarea';
import { Loading } from '../../components/loading';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';
import { ReportDialog } from '../reports/report-dialog';
import Comment from './comment';

const CreateCommentForm = ({
  entityType,
  entityId,
  replyTo,
  onFinish,
}: {
  entityType: CommentEntityType;
  entityId: string;
  replyTo?: string;
  onFinish?: () => void;
}) => {
  const { snackbar } = useSnackbar();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutateAsync, isLoading } = useMutation(api.createComment);
  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      body: '',
    },
  });

  const { ref, ...rest } = register('body');

  useImperativeHandle(ref, () => textareaRef.current);

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      const text = `@${replyTo} `;
      const textLength = text.length;
      textareaRef.current.value = text;
      textareaRef.current.focus();
      // Position cursor at the end of the text
      textareaRef.current.setSelectionRange(textLength, textLength);
    }
  }, [replyTo, textareaRef]);

  const submit = async (data: any) => {
    if (!data.body.trim()) {
      snackbar('Comment cannot be empty', { isError: true });
      return;
    }

    try {
      await mutateAsync({
        body: data.body.trim(),
        entityType,
        entityId,
      });
      reset();

      onFinish();
    } catch (error) {
      snackbar('Failed to create comment', { isError: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(submit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Textarea
          {...rest}
          ref={textareaRef}
          placeholder="Say something..."
          onKeyDown={handleKeyDown}
        />
        {isDirty && (
          <Button type="submit" disabled={isLoading}>
            Post
          </Button>
        )}
      </Stack>
    </form>
  );
};

export const Comments = ({
  entityType,
  entityId,
}: Omit<FindCommentsDto, 'page'>) => {
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  const { isLoggedIn, me } = useAuth();
  const { snackbar } = useSnackbar();

  const [openReportComment, setOpenReportComment] = useState<string>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const roomId = `${entityType}:${entityId}`;

  const queryClient = useQueryClient();

  const { mutateAsync: deleteComment, isLoading: isDeleting } = useMutation(
    api.deleteComment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          cacheKeys.commentsKey(entityType, entityId),
        );
        snackbar('Comment removed');
      },
      onError: () => {
        snackbar('Failed to remove comment', { isError: true });
      },
    },
  );

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.commentsKey(entityType, entityId),
      async ({ pageParam = 1 }) =>
        api.getComments({ entityType, entityId, page: pageParam }),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  // Handle incoming real time comments
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewComment = (newComment) => {
      queryClient.setQueryData(
        cacheKeys.commentsKey(entityType, entityId),
        (old: any) => {
          const updatedPages = old.pages.map((page: any) => {
            if (page.currentPage === 1) {
              return {
                ...page,
                comments: [newComment, ...page.comments],
                totalItems: page.totalItems + 1,
                currentItems: page.currentItems + 1,
              };
            }
            return page;
          });
          return {
            ...old,
            pages: updatedPages,
          };
        },
      );
    };

    socket.on('new-comment', handleNewComment);

    return () => {
      socket.off('new-comment', handleNewComment);
    };
  }, [socket, isConnected, entityType, entityId]);

  // Join/leave room
  useEffect(() => {
    if (!isConnected) return;

    joinRoom(roomId);

    return () => {
      leaveRoom(roomId);
    };
  }, [isConnected, roomId, joinRoom, leaveRoom]);

  const handleRemove = async (commentId: string) => {
    try {
      const confirmed = confirm(
        'Are you sure you want to remove this comment?',
      );
      if (confirmed) await deleteComment(commentId);
    } catch (error) {
      snackbar('Failed to remove comment', { isError: true });
    }
  };

  return (
    <Stack gap="md">
      {isLoggedIn ? (
        <CreateCommentForm
          entityType={entityType}
          entityId={entityId}
          replyTo={replyTo}
          onFinish={() => setReplyTo(null)}
        />
      ) : (
        <div css={{ padding: '32px 0' }}>
          <Group justify="center">
            <span>Login or sign up to comment</span>
          </Group>
        </div>
      )}
      {isFetching && !isFetchingNextPage && <Loading small />}
      {data && data.pages[0].totalItems > 0 ? (
        data.pages.map((page) => (
          <Fragment key={page.currentPage}>
            {page.comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReport={
                  isLoggedIn && me?.id !== comment.user.id
                    ? () => setOpenReportComment(comment.id)
                    : null
                }
                onRemove={
                  isLoggedIn && me?.id === comment.user.id
                    ? () => handleRemove(comment.id)
                    : null
                }
                onReply={
                  isLoggedIn && me?.id !== comment.user.id
                    ? () => setReplyTo(comment.user.username)
                    : null
                }
              />
            ))}
          </Fragment>
        ))
      ) : (
        <Feedback message="No comments yet" />
      )}
      {!isFetching && hasNextPage && (
        <FetchMoreOnClick handleFetchMore={fetchNextPage} />
      )}
      <ReportDialog
        isOpen={!!openReportComment}
        onClose={() => setOpenReportComment(null)}
        type={ReportType.COMMENT}
        id={openReportComment || ''}
      />
    </Stack>
  );
};
