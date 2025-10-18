import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { ReleaseSubmissionItem } from './release-submission-list';
import { Feedback } from '../../components/feedback';
import { CommentEntityType } from 'shared';
import { Comments } from '../comments/comments';

const ReleaseSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const { mutateAsync: discardFn } = useMutation(
    api.discardMyReleaseSubmission,
  );

  const { data: submission, isLoading } = useQuery(
    cacheKeys.releaseSubmissionByIdKey(submissionId!),
    () => api.getReleaseSubmissionById(submissionId!),
    {
      enabled: !!submissionId,
    },
  );

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
        discardFn={discardFn}
        fullPage
      />
      <Comments
        entityType={CommentEntityType.RELEASE_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default ReleaseSubmissionPage;
