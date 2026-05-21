import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { useAuth } from '../account/useAuth';
import { IReviewVote, VoteType } from 'shared';

export function useUserReviewVotes(reviewIds: string[]) {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const queryKey = ['userReviewVotes', reviewIds.join(',')];
  const { data } = useQuery(queryKey, () => api.getUserReviewVotes(reviewIds), {
    enabled: isLoggedIn && reviewIds.length > 0,
  });

  const updateVote = (reviewId: string, vote: VoteType | undefined) => {
    queryClient.setQueryData<IReviewVote[]>(queryKey, (oldData) => {
      if (!oldData) return [];
      return oldData.map((v) => (v.reviewId === reviewId ? { ...v, vote } : v));
    });
  };
  return { data, updateVote };
}
