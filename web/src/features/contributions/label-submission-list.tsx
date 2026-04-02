import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getLabelPath,
  ILabelSubmission,
  SubmissionSortByEnum,
  SubmissionStatus,
  SubmissionType,
} from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionField, SubmissionItemWrapper } from './submission-item';

class LabelSubmissionListOutletContext {
  status?: SubmissionStatus;
  type?: SubmissionType;
  userId?: string;
  labelId?: string;
  voteByUserId?: string;
  sortBy?: SubmissionSortByEnum;
}

interface LabelSubmissionItemProps {
  submission: ILabelSubmission;
  hideUser?: boolean;
  fullPage?: boolean;
  onUpdate?: (submission: ILabelSubmission) => void;
}

export const LabelSubmissionItem = ({
  submission,
  hideUser,
  fullPage,
  onUpdate,
}: LabelSubmissionItemProps) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      link={submission.labelId && getLabelPath({ labelId: submission.labelId })}
      voteFn={api.labelSubmissionVote}
      hideUser={hideUser}
      submission={submission}
      submissionType="label"
      fullPage={fullPage}
      onUpdate={onUpdate}
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
      <SubmissionField
        label="Short name"
        originalValue={original?.shortName}
        changedValue={changes?.shortName}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Disambiguation"
        originalValue={original?.disambiguation}
        changedValue={changes?.disambiguation}
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
  const { status, type, labelId, userId, voteByUserId, sortBy } =
    useOutletContext<LabelSubmissionListOutletContext>();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.labelSubmissionsKey({
        status,
        type,
        labelId,
        userId,
        voteByUserId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getLabelSubmissions({
          page: pageParam,
          status,
          type,
          labelId,
          userId,
          voteByUserId,
          sortBy,
        }),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  const queryClient = useQueryClient();

  const handleUpdateAfterVote = (submission: ILabelSubmission) => {
    queryClient.setQueryData(
      cacheKeys.labelSubmissionsKey({
        status,
        labelId,
        userId,
        sortBy,
      }),
      (oldData: any) => {
        const pages = oldData?.pages?.map((page: any) => {
          const labels = page.labels?.map((labelSubmission: any) => {
            if (labelSubmission.id === submission.id) {
              return {
                ...labelSubmission,
                submissionStatus: submission.submissionStatus,
                votes: submission.votes,
              };
            }
            return labelSubmission;
          });
          return {
            ...page,
            labels,
          };
        });
        return { ...oldData, pages };
      },
    );
  };

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
              onUpdate={handleUpdateAfterVote}
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
