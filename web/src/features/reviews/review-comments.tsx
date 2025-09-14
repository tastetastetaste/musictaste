import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { Button } from '../../components/button';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Feedback } from '../../components/feedback';
import { FetchMoreOnClick } from '../../components/fetch-more';
import { Textarea } from '../../components/inputs/textarea';
import { Loading } from '../../components/loading';
import { SINGUP_TO_COMMENT } from '../../static/feedback';
import { useAuth } from '../account/useAuth';
import Comment from '../shared/comment/comment';
import { cacheKeys } from '../../utils/cache-keys';

const CreateReviewCommentForm = ({ reviewId }: { reviewId: string }) => {
  const qc = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(api.createReviewComment, {
    onSuccess: () =>
      qc.invalidateQueries(cacheKeys.reviewCommentsKey(reviewId)),
  });
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

  const { isLoggedIn } = useAuth();

  const submit = async (data: any) => {
    await mutateAsync({
      body: data.body,
      reviewId,
    });
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

export const ReviewComments = ({ reviewId }: { reviewId: string }) => {
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.reviewCommentsKey(reviewId),
      async ({ pageParam = 1 }) => api.getReviewComments(reviewId, pageParam),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  return (
    <Fragment>
      <CreateReviewCommentForm reviewId={reviewId} />
      {isFetching && !isFetchingNextPage && <Loading small />}
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
    </Fragment>
  );
};
