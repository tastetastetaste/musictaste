import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { LabelSubmissionItem } from './label-submission-list';
import { Feedback } from '../../components/feedback';
import { Comments } from '../comments/comments';
import { CommentEntityType } from 'shared';

const LabelSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const { mutateAsync: discardFn } = useMutation(api.discardMyLabelSubmission);

  const { data: submission, isLoading } = useQuery(
    cacheKeys.labelSubmissionByIdKey(submissionId!),
    () => api.getLabelSubmissionById(submissionId!),
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
      <LabelSubmissionItem
        submission={submission}
        discardFn={discardFn}
        fullPage
      />
      <Comments
        entityType={CommentEntityType.LABEL_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default LabelSubmissionPage;
