import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { ArtistSubmissionItem } from './artist-submission-list';
import { Feedback } from '../../components/feedback';
import { Comments } from '../comments/comments';
import { CommentEntityType } from 'shared';

const ArtistSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const { mutateAsync: discardFn } = useMutation(api.discardMyArtistSubmission);

  const { data: submission, isLoading } = useQuery(
    cacheKeys.artistSubmissionByIdKey(submissionId!),
    () => api.getArtistSubmissionById(submissionId!),
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
      <ArtistSubmissionItem
        submission={submission}
        discardFn={discardFn}
        fullPage
      />
      <Comments
        entityType={CommentEntityType.ARTIST_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default ArtistSubmissionPage;
