import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getLabelPath,
  ILabelSubmission,
  SubmissionSortByEnum,
  SubmissionStatus,
} from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import {
  DiscardSubmissionFn,
  SubmissionField,
  SubmissionItemWrapper,
} from './submission-item';

class LabelSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  labelId?: string;
  sortBy?: SubmissionSortByEnum;
}

export const LabelSubmissionItem = ({
  submission,
  hideUser,
  discardFn,
}: {
  submission: ILabelSubmission;
  hideUser?: boolean;
  discardFn?: DiscardSubmissionFn;
}) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      link={submission.labelId && getLabelPath({ labelId: submission.labelId })}
      voteFn={api.labelSubmissionVote}
      hideUser={hideUser}
      discardFn={discardFn}
      submission={submission}
      submissionType="label"
    >
      <SubmissionField
        label="Name"
        originalValue={original?.name}
        changedValue={changes?.name}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Name (Latin)"
        originalValue={original?.nameLatin}
        changedValue={changes?.nameLatin}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      {submission.note && (
        <SubmissionField
          label="Note"
          originalValue={undefined}
          changedValue={submission.note}
          showOriginal={false}
          renderValue={(v) => <Markdown>{v}</Markdown>}
        />
      )}
    </SubmissionItemWrapper>
  );
};

const LabelSubmissionsList: React.FC = () => {
  const { status, labelId, userId, sortBy } =
    useOutletContext<LabelSubmissionListOutletContext>();

  const { mutateAsync: discardFn } = useMutation(api.discardMyLabelSubmission);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.labelSubmissionsKey({
        status,
        labelId,
        userId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getLabelSubmissions({
          page: pageParam,
          status,
          labelId,
          userId,
          sortBy,
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
            <LabelSubmissionItem
              key={submission.id}
              submission={submission}
              hideUser={!!userId}
              discardFn={discardFn}
            />
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
