import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { ILabelSubmission } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

type Props = {
  open?: boolean;
  userId?: string;
  labelId?: string;
};

const SubmissionItem = ({ submission }: { submission: ILabelSubmission }) => {
  return (
    <Stack key={submission.id}>
      {submission.name && (
        <div>
          <span>name: {submission.name}</span>
        </div>
      )}
    </Stack>
  );
};

export const LabelSubmissionsList: React.FC<Props> = ({
  open,
  labelId,
  userId,
}) => {
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.labelSubmissionsKey({
        open,
        labelId,
        userId,
      }),
      async ({ pageParam = 1 }) =>
        api.getLabelSubmissions({
          page: pageParam,
          open,
          labelId,
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
        <Stack key={page.currentPage} gap="lg">
          {page.labels.map((submission) => (
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
