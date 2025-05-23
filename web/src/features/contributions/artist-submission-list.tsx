import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { IArtistSubmission, SubmissionStatus } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionActions, SubmissionItemWrapper } from './submission-item';
import { getArtistPathname } from '../../utils/get-pathname';
import { Link } from '../../components/links/link';
import { useOutletContext } from 'react-router-dom';

class ArtistSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  artistId?: string;
}

export const ArtistSubmissionItem = ({
  submission,
}: {
  submission: IArtistSubmission;
}) => {
  return (
    <SubmissionItemWrapper status={submission.submissionStatus}>
      {submission.name && (
        <div>
          <span>name: {submission.name}</span>
        </div>
      )}
      {submission.artistId && (
        <div>
          <Link to={getArtistPathname(submission.artistId)}>link</Link>
        </div>
      )}
      <SubmissionActions
        id={submission.id}
        status={submission.submissionStatus}
        voteFn={api.artistSubmissionVote}
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
            <ArtistSubmissionItem submission={submission} />
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
