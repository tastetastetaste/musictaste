import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { CommentEntityType } from 'shared';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Comments } from '../comments/comments';
import { ArtistSubmissionItem } from './artist-submission-list';

const ArtistSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

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
      <ArtistSubmissionItem submission={submission} fullPage />
      <Comments
        entityType={CommentEntityType.ARTIST_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default ArtistSubmissionPage;
