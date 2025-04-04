import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { Feedback } from '../../components/feedback';
import { useAuth } from '../account/useAuth';
import { Review } from './review';
import { ReportDialog } from '../reports/report-dialog';
import { useState } from 'react';
import { cacheKeys } from '../../utils/cache-keys';
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

  if (isFetching && !data) {
    return <Loading />;
  }

  if (!id || !data || !data.entry || !data.entry.reviewId) {
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

  const isMyReview = me?.id === data.entry.userId;

  return (
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

      <ReportDialog
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        id={id}
        type="review"
      />
    </AppPageWrapper>
  );
};

export default ReviewPage;
