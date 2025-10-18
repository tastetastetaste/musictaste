import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { GenreSubmissionItem } from './genre-submission-list';
import { Feedback } from '../../components/feedback';
import { Comments } from '../comments/comments';
import { CommentEntityType } from 'shared';

const GenreSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const { data: submission, isLoading } = useQuery(
    cacheKeys.genreSubmissionByIdKey(submissionId!),
    () => api.getGenreSubmissionById(submissionId!),
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
      <GenreSubmissionItem submission={submission} fullPage />
      <Comments
        entityType={CommentEntityType.GENRE_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default GenreSubmissionPage;
