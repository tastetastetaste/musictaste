import { Fragment } from 'react';
import { useInfiniteQuery, useMutation } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import {
  IReleaseSubmission,
  SubmissionStatus,
  SubmissionSortByEnum,
} from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { formatReleaseType } from '../releases/format-release-type';
import { getReleasePathname } from '../../utils/get-pathname';
import {
  DiscardSubmissionFn,
  ImagePreview,
  SubmissionField,
  SubmissionItemWrapper,
  TracksComparisonField,
} from './submission-item';
import { Typography } from '../../components/typography';
import { ExplicitCoverArtOptions } from './add-release-page';
import { Markdown } from '../../components/markdown';

export const ReleaseSubmissionItem = ({
  submission,
  hideUser,
  discardFn,
}: {
  submission: IReleaseSubmission;
  hideUser?: boolean;
  discardFn?: DiscardSubmissionFn;
}) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;

  return (
    <SubmissionItemWrapper
      link={submission.releaseId && getReleasePathname(submission.releaseId)}
      voteFn={api.releaseSubmissionVote}
      hideUser={hideUser}
      submission={submission}
      discardFn={discardFn}
      submissionType="release"
    >
      <SubmissionField
        label="Title"
        originalValue={original?.title}
        changedValue={changes?.title}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Title (Latin)"
        originalValue={original?.titleLatin}
        changedValue={changes?.titleLatin}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Artists"
        originalValue={original?.artists}
        changedValue={changes?.artists}
        showOriginal={hasOriginal}
        renderValue={(value) => (
          <span>
            {value
              .map((a) => a?.name + (a?.nameLatin ? ` [${a?.nameLatin}]` : ''))
              .join(', ')}
          </span>
        )}
      />
      <SubmissionField
        label="Type"
        originalValue={original?.type}
        changedValue={changes?.type}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{formatReleaseType(v)}</span>}
      />
      <SubmissionField
        label="Date"
        originalValue={original?.date}
        changedValue={changes?.date}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Labels"
        originalValue={original?.labels}
        changedValue={changes?.labels}
        showOriginal={hasOriginal}
        renderValue={(value) => (
          <span>{value.map((l) => l?.name).join(', ')}</span>
        )}
      />
      <SubmissionField
        label="Languages"
        originalValue={original?.languages}
        changedValue={changes?.languages}
        showOriginal={hasOriginal}
        renderValue={(value) => (
          <span>{value.map((l) => l?.name).join(', ')}</span>
        )}
      />
      <TracksComparisonField
        originalTracks={original?.tracks || []}
        changedTracks={changes?.tracks || []}
        showOriginal={hasOriginal}
      />
      <SubmissionField
        label="Image"
        originalValue={original?.imageUrl}
        changedValue={changes?.imageUrl}
        showOriginal={hasOriginal}
        renderValue={(value) =>
          value ? (
            <div>
              <ImagePreview src={value} alt="cover" />
            </div>
          ) : null
        }
      />
      <SubmissionField
        label="Explicit Cover Art"
        originalValue={original?.explicitCoverArt}
        changedValue={changes?.explicitCoverArt}
        showOriginal={hasOriginal}
        renderValue={(value) => (
          <span>
            {value
              .map(
                (v) =>
                  ExplicitCoverArtOptions.find((o) => o.value === v)?.label,
              )
              .join(', ')}
          </span>
        )}
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

export class ReleaseSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  releaseId?: string;
  sortBy?: SubmissionSortByEnum;
}

const ReleaseSubmissionsList = () => {
  const { userId, releaseId, status, sortBy } =
    useOutletContext<ReleaseSubmissionListOutletContext>();

  const { mutateAsync: discardFn } = useMutation(
    api.discardMyReleaseSubmission,
  );

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.releaseSubmissionsKey({
        status,
        releaseId,
        userId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getReleaseSubmissions({
          page: pageParam,
          status,
          releaseId,
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
          {page.releases.map((submission) => (
            <ReleaseSubmissionItem
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

export default ReleaseSubmissionsList;
