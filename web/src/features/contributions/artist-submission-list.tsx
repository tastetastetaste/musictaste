import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getArtistPath,
  IArtistSubmission,
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

class ArtistSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  artistId?: string;
  sortBy?: SubmissionSortByEnum;
}

interface ArtistSubmissionItemProps {
  submission: IArtistSubmission;
  hideUser?: boolean;
  discardFn?: DiscardSubmissionFn;
  fullPage?: boolean;
}

export const ArtistSubmissionItem = ({
  submission,
  hideUser,
  discardFn,
  fullPage,
}: ArtistSubmissionItemProps) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      link={
        submission.artistId && getArtistPath({ artistId: submission.artistId })
      }
      voteFn={api.artistSubmissionVote}
      hideUser={hideUser}
      discardFn={discardFn}
      submission={submission}
      submissionType="artist"
      fullPage={fullPage}
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

const ArtistSubmissionsList: React.FC = () => {
  const { status, artistId, userId, sortBy } =
    useOutletContext<ArtistSubmissionListOutletContext>();

  const { mutateAsync: discardFn } = useMutation(api.discardMyArtistSubmission);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.artistSubmissionsKey({
        status,
        artistId,
        userId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getArtistSubmissions({
          page: pageParam,
          status,
          artistId,
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
          {page.artists.map((submission) => (
            <ArtistSubmissionItem
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

export default ArtistSubmissionsList;
