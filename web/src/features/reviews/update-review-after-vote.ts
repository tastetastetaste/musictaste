import { InfiniteData, QueryClient } from '@tanstack/react-query';
import { IReview, IReviewResponse, IReviewsResponse, VoteType } from 'shared';

export type UpdateReviewAfterVoteFu = (vote: VoteType) => void;

export const updateReviewAfterVote = ({
  vote,
  currentUserVote,
  cacheKey,
  queryClient,
}: {
  vote: VoteType;
  currentUserVote?: VoteType;
  cacheKey: any;
  queryClient: QueryClient;
}) => {
  const isRemoving = typeof currentUserVote === 'number';

  queryClient.setQueryData<IReviewResponse | undefined>(cacheKey, (oldData) => {
    if (oldData?.entry?.review === undefined) return undefined;

    return {
      entry: {
        ...oldData.entry,
        review: {
          ...(oldData.entry.review as IReview),
          totalVotes: isRemoving
            ? +oldData.entry.review.totalVotes - 1
            : +oldData.entry.review.totalVotes + 1,
          netVotes: isRemoving
            ? +oldData.entry.review.netVotes - +currentUserVote
            : +oldData.entry.review.netVotes + vote,
        },
      },
    };
  });
};

export const updateReviewAfterVote_2 = ({
  id,
  vote,
  currentUserVote,
  cacheKey,
  queryClient,
}: {
  id: string;
  vote: VoteType;
  currentUserVote: VoteType | null | undefined;
  cacheKey: any;
  queryClient: QueryClient;
}) => {
  const isRemoving = typeof currentUserVote === 'number';

  queryClient.setQueryData<IReviewsResponse | undefined>(
    cacheKey,
    (oldData) => {
      if (oldData === undefined) return undefined;

      const entries: IReviewsResponse['entries'] = oldData.entries.map((r) => {
        if (r.reviewId === id) {
          return {
            ...r,
            review: {
              ...(r.review as IReview),
              totalVotes: isRemoving
                ? +r.review.totalVotes - 1
                : +r.review.totalVotes + 1,
              netVotes: isRemoving
                ? +r.review.netVotes - +currentUserVote!
                : +r.review.netVotes + vote,
            },
          };
        }
        return r;
      });

      return {
        ...oldData,
        entries,
      };
    },
  );
};

export const updateReviewAfterVote_3 = ({
  id,
  vote,
  currentUserVote,
  cacheKey,
  queryClient,
}: {
  id: string;
  vote: VoteType;
  currentUserVote: VoteType | null | undefined;
  cacheKey: any;
  queryClient: QueryClient;
}) => {
  const isRemoving = typeof currentUserVote === 'number';

  queryClient.setQueryData<InfiniteData<IReviewsResponse> | undefined>(
    cacheKey,
    (oldData) => {
      if (oldData === undefined) return undefined;

      const pages: InfiniteData<IReviewsResponse>['pages'] = oldData.pages.map(
        (p) => {
          const entries: IReviewsResponse['entries'] = p.entries.map((r) => {
            if (r.reviewId === id) {
              return {
                ...r,
                review: {
                  ...(r.review as IReview),
                  totalVotes: isRemoving
                    ? +r.review.totalVotes - 1
                    : +r.review.totalVotes + 1,
                  netVotes: isRemoving
                    ? +r.review.netVotes - +currentUserVote!
                    : +r.review.netVotes + vote,
                },
              };
            }
            return r;
          });

          return { ...p, entries };
        },
      );

      return {
        ...oldData,
        pages,
      };
    },
  );
};
