import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { CommentEntityType, ILabelSubmission } from 'shared';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Comments } from '../comments/comments';
import { LabelSubmissionItem } from './label-submission-list';

const LabelSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useQuery(
    cacheKeys.labelSubmissionByIdKey(submissionId!),
    () => api.getLabelSubmissionById(submissionId!),
    {
      enabled: !!submissionId,
    },
  );

  const handleUpdateAfterVote = (submission: ILabelSubmission) => {
    queryClient.setQueryData(
      cacheKeys.labelSubmissionByIdKey(submissionId!),
      (oldData: any) => {
        return {
          ...oldData,
          submissionStatus: submission.submissionStatus,
          votes: submission.votes,
        };
      },
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!submission) {
    return <Feedback message="Not found" />;
  }
  return (
    <AppPageWrapper>
      <LabelSubmissionItem
        submission={submission}
        fullPage
        onUpdate={handleUpdateAfterVote}
      />
      <Comments
        entityType={CommentEntityType.LABEL_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default LabelSubmissionPage;
