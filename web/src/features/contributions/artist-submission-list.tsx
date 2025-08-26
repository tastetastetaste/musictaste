import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { IArtistSubmission, SubmissionStatus } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { getArtistPathname } from '../../utils/get-pathname';
import { SubmissionField, SubmissionItemWrapper } from './submission-item';

class ArtistSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  artistId?: string;
}

export const ArtistSubmissionItem = ({
  submission,
  hideUser,
}: {
  submission: IArtistSubmission;
  hideUser?: boolean;
}) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      status={submission.submissionStatus}
      link={submission.artistId && getArtistPathname(submission.artistId)}
      id={submission.id}
      voteFn={api.artistSubmissionVote}
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

const ArtistSubmissionsList: React.FC = () => {
  const { status, artistId, userId } =
    useOutletContext<ArtistSubmissionListOutletContext>();
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.artistSubmissionsKey({
        status,
        artistId,
        userId,
      }),
      async ({ pageParam = 1 }) =>
        api.getArtistSubmissions({
          page: pageParam,
          status,
          artistId,
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
          {page.artists.map((submission) => (
            <ArtistSubmissionItem submission={submission} hideUser={!!userId} />
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
