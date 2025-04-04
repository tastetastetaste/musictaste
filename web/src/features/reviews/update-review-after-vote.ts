import { QueryClient, InfiniteData } from 'react-query';
import { IEntriesResponse, IEntryResonse, IReview, VoteType } from 'shared';

export type UpdateReviewAfterVoteFu = (
  reviewId: string,
  vote: VoteType,
) => void;
export const updateReviewAfterVote = ({
  vote,
  cacheKey,
  queryClient,
}: {
  vote: VoteType;
  cacheKey: any;
  queryClient: QueryClient;
}) => {
  queryClient.setQueryData<IEntryResonse | undefined>(cacheKey, (oldData) => {
    if (oldData === undefined) return undefined;

    return {
      entry: {
        ...oldData.entry,
        review: {
          ...(oldData.entry.review as IReview),
          totalVotes: oldData.entry.review.userVote
            ? +oldData.entry.review.totalVotes - 1
            : +oldData.entry.review.totalVotes + 1,
          netVotes: oldData.entry.review.userVote
            ? +oldData.entry.review.netVotes - +oldData.entry.review.userVote
            : +oldData.entry.review.netVotes + vote,
          userVote: oldData.entry.review.userVote ? null : vote,
        },
      },
    };
  });
};
export const updateReviewAfterVote_2 = ({
  id,
  vote,
  cacheKey,
  queryClient,
}: {
  id: string;
  vote: VoteType;
  cacheKey: any;
  queryClient: QueryClient;
}) => {
  queryClient.setQueryData<IEntriesResponse | undefined>(
    cacheKey,
    (oldData) => {
      if (oldData === undefined) return undefined;

      const entries: IEntriesResponse['entries'] = [];

      oldData.entries.forEach((r) => {
        if (r.reviewId === id) {
          entries.push({
            ...r,
            review: {
              ...(r.review as IReview),
              totalVotes: r.review.userVote
                ? +r.review.totalVotes - 1
                : +r.review.totalVotes + 1,
              netVotes: r.review.userVote
                ? +r.review.netVotes - +r.review.userVote
                : +r.review.netVotes + vote,
              userVote: r.review.userVote ? null : vote,
            },
          });
        } else {
          entries.push(r);
        }
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
  page,
  cacheKey,
  queryClient,
}: {
  id: string;
  vote: VoteType;
  page: number;
  cacheKey: any;
  queryClient: QueryClient;
}) => {
  queryClient.setQueryData<InfiniteData<IEntriesResponse> | undefined>(
    cacheKey,
    (oldData) => {
      if (oldData === undefined) return undefined;

      const pages: InfiniteData<IEntriesResponse>['pages'] = [];

      oldData.pages.forEach((p) => {
        if (p.currentPage === page) {
          const entries: IEntriesResponse['entries'] = [];

          p.entries.forEach((r) => {
            if (r.reviewId === id) {
              entries.push({
                ...r,
                review: {
                  ...(r.review as IReview),
                  totalVotes: r.review.userVote
                    ? +r.review.totalVotes - 1
                    : +r.review.totalVotes + 1,
                  netVotes: r.review.userVote
                    ? +r.review.netVotes - +r.review.userVote
                    : +r.review.netVotes + vote,
                  userVote: r.review.userVote ? null : vote,
                },
              });
            } else {
              entries.push(r);
            }
          });

          pages.push({ ...p, entries });
        } else {
          pages.push(p);
        }
      });

      return {
        ...oldData,
        pages,
      };
    },
  );
};
