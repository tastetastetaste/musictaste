import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportType } from 'shared';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
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

  const cacheKey = cacheKeys.entryKey(id);

  const { data, isFetching } = useQuery(cacheKey, () => api.getEntry(id), {
    enabled: !!id,
  });

  const { mutateAsync } = useMutation(api.updateEntry);

  const { me } = useAuth();

  const navigate = useNavigate();

  const [openReport, setOpenReport] = useState(false);

  if (!isFetching && (!id || !data || !data.entry || !data.entry.reviewId)) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }

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

  const isMyReview = me?.id === data?.entry?.userId;

  return (
    <UserThemeProvider user={data?.entry?.user}>
      <AppPageWrapper
        title="Review"
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
        ) : (
          <Review
            entry={data.entry}
            updateAfterVote={(_, vote) =>
              updateReviewAfterVote({
                vote,
                cacheKey,
                queryClient: qc,
              })
            }
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
