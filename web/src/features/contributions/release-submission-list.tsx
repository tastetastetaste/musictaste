import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getReleasePath,
  IReleaseSubmission,
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
import { formatReleaseType } from '../releases/format-release-type';
import { ExplicitCoverArtOptions } from './add-release-page';
import {
  ImagePreview,
  SubmissionField,
  SubmissionItemWrapper,
  TracksComparisonField,
} from './submission-item';
import { useHideExplicitCoverArt } from '../releases/release/shared';
import { IconButton } from '../../components/icon-button';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import { useAuth } from '../account/useAuth';

interface ReleaseSubmissionItemProps {
  submission: IReleaseSubmission;
  hideUser?: boolean;
  fullPage?: boolean;
  onUpdate?: (submission: IReleaseSubmission) => void;
}

export const ReleaseSubmissionItem = ({
  submission,
  hideUser,
  fullPage,
  onUpdate,
}: ReleaseSubmissionItemProps) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;

  const { isLoggedIn } = useAuth();

  const hideExplicitCoverArt = useHideExplicitCoverArt([
    ...(original?.explicitCoverArt || []),
    ...(changes?.explicitCoverArt || []),
  ]);

  const [revealCover, setRevealCover] = useState(false);
  const showCover = !hideExplicitCoverArt || revealCover;

  const explicitPlaceholder = '/placeholder/explicit-lg.jpeg';

  return (
    <SubmissionItemWrapper
      link={
        submission.releaseId &&
        getReleasePath({ releaseId: submission.releaseId })
      }
      voteFn={api.releaseSubmissionVote}
      hideUser={hideUser}
      submission={submission}
      submissionType="release"
      fullPage={fullPage}
      onUpdate={onUpdate}
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
        renderValue={(value) => {
          return value ? (
            <div
              css={{
                position: 'relative',
                display: 'flex',
                width: 'fit-content',
              }}
            >
              <ImagePreview
                src={showCover ? value : explicitPlaceholder}
                alt="cover"
              />
              {isLoggedIn && hideExplicitCoverArt ? (
                <div
                  css={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    zIndex: 2,
                  }}
                >
                  <IconButton
                    title="show"
                    onClick={() => setRevealCover(!revealCover)}
                    variant="solid"
                  >
                    {showCover ? <IconEye /> : <IconEyeClosed />}
                  </IconButton>
                </div>
              ) : null}
            </div>
          ) : null;
        }}
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
  type?: SubmissionType;
  userId?: string;
  releaseId?: string;
  voteByUserId?: string;
  sortBy?: SubmissionSortByEnum;
}

const ReleaseSubmissionsList = () => {
  const { userId, releaseId, status, type, sortBy, voteByUserId } =
    useOutletContext<ReleaseSubmissionListOutletContext>();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.releaseSubmissionsKey({
        status,
        type,
        releaseId,
        userId,
        voteByUserId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getReleaseSubmissions({
          page: pageParam,
          status,
          type,
          releaseId,
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

  const handleUpdateAfterVote = (submission: IReleaseSubmission) => {
    queryClient.setQueryData(
      cacheKeys.releaseSubmissionsKey({
        status,
        releaseId,
        userId,
        sortBy,
      }),
      (oldData: any) => {
        const pages = oldData?.pages?.map((page: any) => {
          const releases = page.releases?.map((releaseSubmission: any) => {
            if (releaseSubmission.id === submission.id) {
              return {
                ...releaseSubmission,
                submissionStatus: submission.submissionStatus,
                votes: submission.votes,
              };
            }
            return releaseSubmission;
          });
          return {
            ...page,
            releases,
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
          {page.releases.map((submission) => (
            <ReleaseSubmissionItem
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

export default ReleaseSubmissionsList;
