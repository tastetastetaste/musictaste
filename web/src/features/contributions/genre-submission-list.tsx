import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import {
  IGenreSubmission,
  SubmissionStatus,
  SubmissionSortByEnum,
} from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
// import { getGenrePathname } from '../../utils/get-pathname';
import { SubmissionField, SubmissionItemWrapper } from './submission-item';
import { Typography } from '../../components/typography';

class GenreSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  genreId?: string;
  sortBy?: SubmissionSortByEnum;
}

export const GenreSubmissionItem = ({
  submission,
  hideUser,
}: {
  submission: IGenreSubmission;
  hideUser?: boolean;
}) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      // link={submission.genreId && getGenrePathname(submission.genreId)}
      voteFn={api.genreSubmissionVote}
      hideUser={hideUser}
      submission={submission}
      submissionType="genre"
    >
      <SubmissionField
        label="Name"
        originalValue={original?.name}
        changedValue={changes?.name}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Bio"
        originalValue={original?.bio}
        changedValue={changes?.bio}
        showOriginal={hasOriginal}
        renderValue={(v) => <Typography whiteSpace="pre-wrap">{v}</Typography>}
      />
      <SubmissionField
        label="Note"
        originalValue={submission.note}
        changedValue={submission.note}
        showOriginal={hasOriginal}
        renderValue={(v) => <Typography whiteSpace="pre-wrap">{v}</Typography>}
      />
    </SubmissionItemWrapper>
  );
};

const GenreSubmissionsList: React.FC = () => {
  const { status, genreId, userId, sortBy } =
    useOutletContext<GenreSubmissionListOutletContext>();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.genreSubmissionsKey({
        status,
        genreId,
        userId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getGenreSubmissions({
          page: pageParam,
          status,
          genreId,
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
          {page.genres.map((submission) => (
            <GenreSubmissionItem
              key={submission.id}
              submission={submission}
              hideUser={!!userId}
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

export default GenreSubmissionsList;
