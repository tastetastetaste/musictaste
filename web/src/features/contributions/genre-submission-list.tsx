import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  IGenreSubmission,
  SubmissionSortByEnum,
  SubmissionStatus,
} from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionField, SubmissionItemWrapper } from './submission-item';

class GenreSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  genreId?: string;
  sortBy?: SubmissionSortByEnum;
}

interface GenreSubmissionItemProps {
  submission: IGenreSubmission;
  hideUser?: boolean;
  fullPage?: boolean;
  onUpdate?: (submission: IGenreSubmission) => void;
}

export const GenreSubmissionItem = ({
  submission,
  hideUser,
  fullPage,
  onUpdate,
}: GenreSubmissionItemProps) => {
  const { original, changes } = submission;
  const hasOriginal = !!original;
  return (
    <SubmissionItemWrapper
      voteFn={api.genreSubmissionVote}
      hideUser={hideUser}
      submission={submission}
      submissionType="genre"
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
        label="Bio"
        originalValue={original?.bio}
        changedValue={changes?.bio}
        showOriginal={hasOriginal}
        renderValue={(v) => <Markdown>{v}</Markdown>}
      />
      <SubmissionField
        label="Note"
        originalValue={undefined}
        changedValue={submission.note}
        showOriginal={false}
        renderValue={(v) => <Markdown>{v}</Markdown>}
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

  const queryClient = useQueryClient();

  const handleUpdateAfterVote = (submission: IGenreSubmission) => {
    queryClient.setQueryData(
      cacheKeys.genreSubmissionsKey({
        status,
        genreId,
        userId,
        sortBy,
      }),
      (oldData: any) => {
        const pages = oldData?.pages?.map((page: any) => {
          const genres = page.genres?.map((genreSubmission: any) => {
            if (genreSubmission.id === submission.id) {
              return {
                ...genreSubmission,
                submissionStatus: submission.submissionStatus,
                votes: submission.votes,
              };
            }
            return genreSubmission;
          });
          return {
            ...page,
            genres,
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
          {page.genres.map((submission) => (
            <GenreSubmissionItem
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

export default GenreSubmissionsList;
