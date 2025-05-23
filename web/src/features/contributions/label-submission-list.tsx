import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { ILabelSubmission, SubmissionStatus } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionActions, SubmissionItemWrapper } from './submission-item';
import { Link } from '../../components/links/link';
import { getLabelPathname } from '../../utils/get-pathname';
import { useOutletContext } from 'react-router-dom';

class LabelSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  labelId?: string;
}

export const LabelSubmissionItem = ({
  submission,
}: {
  submission: ILabelSubmission;
}) => {
  return (
    <SubmissionItemWrapper status={submission.submissionStatus}>
      {submission.name && (
        <div>
          <span>name: {submission.name}</span>
        </div>
      )}
      {submission.labelId && (
        <div>
          <Link to={getLabelPathname(submission.labelId)}>link</Link>
        </div>
      )}
      <SubmissionActions
        id={submission.id}
        status={submission.submissionStatus}
        voteFn={api.labelSubmissionVote}
      />
    </SubmissionItemWrapper>
  );
};

const LabelSubmissionsList: React.FC = () => {
  const { status, labelId, userId } =
    useOutletContext<LabelSubmissionListOutletContext>();
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.labelSubmissionsKey({
        status,
        labelId,
        userId,
      }),
      async ({ pageParam = 1 }) =>
        api.getLabelSubmissions({
          page: pageParam,
          status,
          labelId,
          userId,
        }),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  if (isFetching && !isFetchingNextPage) {
    return <Loading />;
  }

  return (
    <Fragment>
      {data?.pages.map((page) => (
        <Stack key={page.currentPage}>
          {page.labels.map((submission) => (
            <LabelSubmissionItem submission={submission} />
          ))}
        </Stack>
      ))}
      {!isFetching && hasNextPage && (
        <FetchMore handleFetchMore={fetchNextPage} />
      )}
    </Fragment>
  );
};

export default LabelSubmissionsList;
