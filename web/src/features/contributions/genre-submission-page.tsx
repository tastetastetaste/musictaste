import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { GenreSubmissionItem } from './genre-submission-list';
import { Feedback } from '../../components/feedback';
import { Comments } from '../comments/comments';
import { CommentEntityType, IGenreSubmission } from 'shared';

const GenreSubmissionPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useQuery(
    cacheKeys.genreSubmissionByIdKey(submissionId!),
    () => api.getGenreSubmissionById(submissionId!),
    {
      enabled: !!submissionId,
    },
  );

  const handleUpdateAfterVote = (submission: IGenreSubmission) => {
    queryClient.setQueryData(
      cacheKeys.genreSubmissionByIdKey(submissionId!),
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
      <GenreSubmissionItem
        submission={submission}
        fullPage
        onUpdate={handleUpdateAfterVote}
      />
      <Comments
        entityType={CommentEntityType.GENRE_SUBMISSION}
        entityId={submission.id}
      />
    </AppPageWrapper>
  );
};

export default GenreSubmissionPage;
