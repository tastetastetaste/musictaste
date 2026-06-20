import { IconSortDescending } from '@tabler/icons-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  IEntryWithReview,
  IUserSummary,
  ReviewsSortByEnum,
  VoteType,
} from 'shared';
import { Feedback } from '../../components/feedback';
import { FetchMore } from '../../components/fetch-more';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Select } from '../../components/inputs/select';
import { Loading } from '../../components/loading';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Review } from './review';
import { updateReviewAfterVote_3 } from './update-review-after-vote';
import { useUserReviewVotes } from './useUserReviewVotes';

export interface ReviewsListRendererProps {
  sortBy?: ReviewsSortByEnum;
  userId?: string;
  releaseId?: string;
  user?: IUserSummary;
  queryEnabled?: boolean;
}

export function ReviewsPageChunk({
  entries,
  user,
  cacheKey,
}: {
  entries: IEntryWithReview[];
  user: IUserSummary;
  cacheKey: (string | number)[];
}) {
  const queryClient = useQueryClient();
  const { data: reviewVotes, updateVote } = useUserReviewVotes(
    entries.map((e) => e.reviewId),
  );

  const entriesWithVotes = useMemo(() => {
    const votesMap = new Map<string, VoteType>();
    if (reviewVotes) {
      reviewVotes.forEach((v) => votesMap.set(v.reviewId, v.vote));
    }

    return entries.map((e) => ({
      ...e,
      review: { ...e.review, userVote: votesMap.get(e.reviewId) },
    }));
  }, [entries, reviewVotes]);

  return (
    <Stack gap="lg">
      {entriesWithVotes.map((e) => (
        <Review
          key={e.id}
          entry={e}
          user={user}
          updateAfterVote={(vote) => {
            const currentUserVote = e.review.userVote;
            const id = e.review.id;
            updateVote(
              id,
              typeof currentUserVote === 'number' ? undefined : vote,
            );
            updateReviewAfterVote_3({
              id,
              vote,
              currentUserVote,
              cacheKey,
              queryClient,
            });
          }}
        />
      ))}
    </Stack>
  );
}

const reviewSortByOption = [
  { value: ReviewsSortByEnum.ReviewDate, label: 'Latest' },
  { value: ReviewsSortByEnum.ReviewTop, label: 'Top' },
];

export function ReviewsListRenderer({
  sortBy: defaultSortBy,
  releaseId,
  userId,
  user,
  queryEnabled,
}: ReviewsListRendererProps) {
  const smallScreen = useMediaQuery({ down: 'sm' });

  const [sortBy, setSortBy] = useState(
    defaultSortBy && defaultSortBy === ReviewsSortByEnum.ReviewTop
      ? reviewSortByOption.find((r) => r.value === ReviewsSortByEnum.ReviewTop)
      : reviewSortByOption.find(
          (r) => r.value === ReviewsSortByEnum.ReviewDate,
        ),
  );

  const cacheKey = cacheKeys.reviewsKey({
    userId,
    releaseId,
    pageSize: 12,
    sortBy: sortBy.value,
  });

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKey,
      async ({ pageParam = 1 }) =>
        api.getReviews({
          userId,
          releaseId,
          pageSize: 12,
          page: pageParam,
          sortBy: sortBy.value,
        }),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
        enabled: queryEnabled,
      },
    );

  return (
    <div>
      {isFetching && !isFetchingNextPage ? (
        <Loading />
      ) : data && data.pages[0].totalItems > 0 ? (
        <Stack gap="lg">
          {/* show sort by on release page and user page */}
          {userId || releaseId ? (
            <Group align="end" justify="end">
              <div
                css={{
                  width: smallScreen ? '100%' : '280px',
                }}
              >
                <Select
                  options={reviewSortByOption}
                  value={sortBy}
                  onChange={(selected: any) => setSortBy(selected)}
                  icon={<IconSortDescending size={20} />}
                />
              </div>
            </Group>
          ) : null}
          {data.pages.map((page) => (
            <ReviewsPageChunk
              key={page.currentPage}
              entries={page.entries}
              user={user}
              cacheKey={cacheKey}
            />
          ))}
        </Stack>
      ) : (
        <Feedback message="There are no reviews yet" />
      )}
      {hasNextPage && <FetchMore handleFetchMore={fetchNextPage} />}
    </div>
  );
}

export default ReviewsListRenderer;
