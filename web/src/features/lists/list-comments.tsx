import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { Button } from '../../components/button';
import { Stack } from '../../components/flex/stack';
import Comment from '../shared/comment/comment';
import { Feedback } from '../../components/feedback';
import { FetchMoreOnClick } from '../../components/fetch-more';
import { Textarea } from '../../components/inputs/textarea';
import { Loading } from '../../components/loading';
import { Group } from '../../components/flex/group';
import { SINGUP_TO_COMMENT } from '../../static/feedback';
import { useAuth } from '../account/useAuth';
import { cacheKeys } from '../../utils/cache-keys';

const CreateListCommentForm = ({ listId }: { listId: string }) => {
  const qc = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { mutateAsync: createListComment, isLoading } = useMutation(
    api.createListComment,
    {
      onSuccess: () => qc.invalidateQueries(cacheKeys.listCommentsKey(listId)),
    },
  );

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

  const submit = async (data: any) => {
    await createListComment({ id: listId, body: data.body });
    reset();
  };

  if (!isLoggedIn) {
    return (
      <Group justify="center">
        <span>{SINGUP_TO_COMMENT}</span>
      </Group>
    );
  }
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap="sm">
        <Textarea
          {...register('body', { required: true })}
          placeholder="Comment"
        />
        {isDirty && (
          <Button type="submit" disabled={isLoading}>
            Comment
          </Button>
        )}
      </Stack>
    </form>
  );
};

const ListComments = ({
  listId,
  commentsCount,
}: {
  listId: string;
  commentsCount: number;
}) => {
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.listCommentsKey(listId),
      async ({ pageParam = 1 }) => api.getListComments(listId, pageParam),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  return (
    <div css={{ marginTop: '10px' }}>
      <CreateListCommentForm listId={listId} />
      {isFetching && !isFetchingNextPage && <Loading small />}
      <div
        css={{
          height: 400,
          overflowY: 'scroll',
        }}
      >
        {data && data.pages[0].totalItems > 0 ? (
          data.pages.map((page) => (
            <Fragment key={page.currentPage}>
              {page.comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </Fragment>
          ))
        ) : (
          <Feedback message="There are no comments" />
        )}
        {!isFetching && hasNextPage && (
          <FetchMoreOnClick handleFetchMore={() => fetchNextPage} />
        )}
      </div>
    </div>
  );
};

export default ListComments;
