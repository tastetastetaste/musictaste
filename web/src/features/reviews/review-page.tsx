import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportType } from 'shared';
import { useUserReviewVotes } from './useUserReviewVotes';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';
import { ReportDialog } from '../reports/report-dialog';
import { UserThemeProvider } from '../theme/user-theme-provider';
import { Review } from './review';
import { updateReviewAfterVote } from './update-review-after-vote';

const ReviewPage = () => {
  const { id } = useParams();

  const qc = useQueryClient();

  const cacheKey = cacheKeys.reviewKey(id);

  const { data, isFetching } = useQuery(cacheKey, () => api.getReview(id), {
    enabled: !!id,
  });

  const { mutateAsync } = useMutation(api.updateEntry);

  const { me } = useAuth();

  const navigate = useNavigate();

  const [openReport, setOpenReport] = useState(false);

  const removeReviewAction = async () => {
    await mutateAsync({
      id,
      rating: data.entry.rating?.rating,
      tags: data.entry.tags?.map((t) => t.id),
      review: undefined,
    }).then(() => {
      navigate(-1);
    });
  };

  const reviewId = data?.entry?.reviewId;

  const { data: reviewVotes, updateVote } = useUserReviewVotes(
    reviewId ? [reviewId] : [],
  );

  const entry = useMemo(() => {
    if (!data?.entry) return null;
    const userVote = reviewVotes?.find((v) => v.reviewId === reviewId)?.vote;
    return {
      ...data.entry,
      review: {
        ...data.entry.review,
        userVote,
      },
    };
  }, [data?.entry, reviewVotes, reviewId]);

  const isMyReview = me?.id === data?.entry?.userId;

  return (
    <UserThemeProvider user={data?.entry?.user}>
      <AppPageWrapper
        title={
          entry
            ? `${entry.release.artists.map((a) => a.name).join(', ')}: ${entry.release.title} review by ${entry.user.name}`
            : undefined
        }
        canCopyLink
        canCopyReference
        menu={
          isMyReview
            ? [{ label: 'Remove', action: removeReviewAction }]
            : [
                {
                  label: 'Report',
                  action: () => setOpenReport(true),
                },
              ]
        }
      >
        {isFetching ? (
          <Loading />
        ) : !entry ? (
          <Feedback message="Review is not found" />
        ) : (
          <Review
            entry={entry}
            updateAfterVote={(vote) => {
              const currentUserVote = entry.review.userVote;
              updateVote(
                entry.review.id,
                typeof currentUserVote === 'number' ? undefined : vote,
              );
              updateReviewAfterVote({
                vote,
                currentUserVote,
                cacheKey,
                queryClient: qc,
              });
            }}
            fullPage
          />
        )}

        <ReportDialog
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          id={id}
          type={ReportType.REVIEW}
        />
      </AppPageWrapper>
    </UserThemeProvider>
  );
};

export default ReviewPage;
