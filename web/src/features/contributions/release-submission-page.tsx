import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { CommentEntityType, IReleaseSubmission } from 'shared';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Comments } from '../comments/comments';
import { ReleaseSubmissionItem } from './release-submission-list';

const ReleaseSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useQuery(
    cacheKeys.releaseSubmissionByIdKey(submissionId!),
    () => api.getReleaseSubmissionById(submissionId!),
    {
      enabled: !!submissionId,
    },
  );

  const handleUpdateAfterVote = (submission: IReleaseSubmission) => {
    queryClient.setQueryData(
      cacheKeys.releaseSubmissionByIdKey(submissionId!),
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
      <ReleaseSubmissionItem
        submission={submission}
        fullPage
        onUpdate={handleUpdateAfterVote}
      />
      <Comments
        entityType={CommentEntityType.RELEASE_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default ReleaseSubmissionPage;
