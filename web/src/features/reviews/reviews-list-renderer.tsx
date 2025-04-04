import { EntriesSortByEnum } from 'shared';
import { api } from '../../utils/api';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { Feedback } from '../../components/feedback';
import { FetchMore } from '../../components/fetch-more';
import { Loading } from '../../components/loading';
import { Review } from './review';
import { Stack } from '../../components/flex/stack';
import { cacheKeys } from '../../utils/cache-keys';
import { updateReviewAfterVote_3 } from './update-review-after-vote';

export interface ReviewsListRendererProps {
  sortBy?: EntriesSortByEnum.ReviewDate | EntriesSortByEnum.ReviewTop;
  userId?: string;
  releaseId?: string;
}

export function ReviewsListRenderer({
  sortBy,
  releaseId,
  userId,
}: ReviewsListRendererProps) {
  const cacheKey = cacheKeys.entriesKey({
    userId,
    releaseId,
    pageSize: 12,
    sortBy,
    withReview: true,
  });

  const queryClient = useQueryClient();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKey,
      async ({ pageParam = 1 }) =>
        api.getEntries({
          userId,
          releaseId,
          pageSize: 12,
          page: pageParam,
          sortBy,
          withReview: true,
        }),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  return (
    <div>
      {isFetching && !isFetchingNextPage ? (
        <Loading />
      ) : data && data.pages[0].totalItems > 0 ? (
        data.pages.map((page) => (
          <Stack gap="lg" key={page.currentPage}>
            {page.entries.map((r) => (
              <Review
                key={r.id}
                entry={r}
                updateAfterVote={(id, vote) =>
                  updateReviewAfterVote_3({
                    id,
                    vote,
                    page: page.currentPage,
                    cacheKey,
                    queryClient,
                  })
                }
              />
            ))}
          </Stack>
        ))
      ) : (
        <Feedback message="There are no reviews yet" />
      )}
      {hasNextPage && <FetchMore handleFetchMore={fetchNextPage} />}
    </div>
  );
}

export default ReviewsListRenderer;
