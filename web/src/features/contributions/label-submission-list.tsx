import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { ILabelSubmission, SubmissionStatus } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { getLabelPathname } from '../../utils/get-pathname';
import { SubmissionField, SubmissionItemWrapper } from './submission-item';

class LabelSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  labelId?: string;
}

export const LabelSubmissionItem = ({
  submission,
  hideUser,
}: {
  submission: ILabelSubmission;
  hideUser?: boolean;
}) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      status={submission.submissionStatus}
      link={submission.labelId && getLabelPathname(submission.labelId)}
      id={submission.id}
      voteFn={api.labelSubmissionVote}
      user={submission.user}
      hideUser={hideUser}
    >
      <SubmissionField
        label="Name"
        originalValue={original?.name}
        changedValue={changes?.name}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
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
            <LabelSubmissionItem submission={submission} hideUser={!!userId} />
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
