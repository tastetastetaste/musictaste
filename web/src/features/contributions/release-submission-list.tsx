import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { IReleaseSubmission } from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { millisecondsToTimeString } from './release-tracks-fields';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionActions, SubmissionItemWrapper } from './submission-item';
import { getReleasePathname } from '../../utils/get-pathname';
import { Link } from '../../components/links/link';

type Props = {
  open?: boolean;
  userId?: string;
  releaseId?: string;
};

const SubmissionItem = ({ submission }: { submission: IReleaseSubmission }) => {
  return (
    <SubmissionItemWrapper status={submission.submissionStatus}>
      {submission.title && (
        <div>
          <span>title: {submission.title}</span>
        </div>
      )}

      {submission.artists && (
        <div>
          <span>
            artists: {submission.artists.map((a) => a?.name).join(', ')}
          </span>
        </div>
      )}
      {submission.type && (
        <div>
          <span>type: {submission.type}</span>
        </div>
      )}
      {submission.date && (
        <div>
          <span>date: {submission.date}</span>
        </div>
      )}
      {submission.labels && (
        <div>
          <span>label: {submission.labels.map((l) => l?.name).join(', ')}</span>
        </div>
      )}

      {submission.languages && (
        <div>
          <span>
            language: {submission.languages.map((l) => l?.name).join(', ')}
          </span>
        </div>
      )}

      {submission.tracks && (
        <div>
          <div>
            <span>tracks:</span>
          </div>

          {submission.tracks.map((t) => (
            <div>
              <span>{`${t.track} | ${t.title} | ${millisecondsToTimeString(t.durationMs)}`}</span>
            </div>
          ))}
        </div>
      )}

      {submission.imageUrl && (
        <Group gap={10}>
          <span>image:</span>
          <img
            width={75}
            height={75}
            style={{
              width: 75,
              height: 75,
              borderRadius: '50%',
            }}
            src={submission.imageUrl}
            alt=""
          />
        </Group>
      )}
      {submission.releaseId && (
        <div>
          <Link to={getReleasePathname(submission.releaseId)}>link</Link>
        </div>
      )}
      <SubmissionActions
        id={submission.id}
        status={submission.submissionStatus}
        voteFn={api.releaseSubmissionVote}
      />
    </SubmissionItemWrapper>
  );
};

export const ReleaseSubmissionsList: React.FC<Props> = ({
  open,
  releaseId,
  userId,
}) => {
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    cacheKeys.releaseSubmissionsKey({
      open,
      releaseId,
      userId,
    }),
    async ({ pageParam = 1 }) =>
      api.getReleaseSubmissions({
        page: pageParam,
        open,
        releaseId,
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
          {page.releases.map((submission) => (
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
