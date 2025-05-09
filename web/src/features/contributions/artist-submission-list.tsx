import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { IArtistSubmission } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionItemWrapper } from './submission-item';

type Props = {
  open?: boolean;
  userId?: string;
  artistId?: string;
};

const SubmissionItem = ({ submission }: { submission: IArtistSubmission }) => {
  return (
    <SubmissionItemWrapper status={submission.submissionStatus}>
      <Stack key={submission.id}>
        {submission.name && (
          <div>
            <span>name: {submission.name}</span>
          </div>
        )}
      </Stack>
    </SubmissionItemWrapper>
  );
};

export const ArtistSubmissionsList: React.FC<Props> = ({
  open,
  artistId,
  userId,
}) => {
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.artistSubmissionsKey({
        open,
        artistId,
        userId,
      }),
      async ({ pageParam = 1 }) =>
        api.getArtistSubmissions({
          page: pageParam,
          open,
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
            <SubmissionItem submission={submission} />
          ))}
        </Stack>
      ))}
      {!isFetching && hasNextPage && (
        <FetchMore handleFetchMore={fetchNextPage} />
      )}
    </Fragment>
  );
};
