import { Fragment } from 'react';
import { useInfiniteQuery, useMutation } from 'react-query';
import { IReleaseSubmission, SubmissionStatus, VoteType } from 'shared';
import { Button } from '../../components/button';
import { FetchMore } from '../../components/fetch-more';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { api } from '../../utils/api';
import { useAuth } from '../account/useAuth';
import { millisecondsToTimeString } from './release-tracks-fields';
import { cacheKeys } from '../../utils/cache-keys';

type Props = {
  open?: boolean;
  userId?: string;
  releaseId?: string;
};

const SubmissionActions = ({ id }: { id: string }) => {
  const {
    mutateAsync: updateStatus,
    data,
    isLoading,
  } = useMutation(api.releaseSubmissionVote);

  return (
    <Group gap={10}>
      {data ? (
        <span>Ok</span>
      ) : (
        <Fragment>
          <Button
            variant="main"
            disabled={isLoading}
            onClick={() =>
              updateStatus({ submissionId: id, vote: VoteType.UP })
            }
          >
            Yes
          </Button>
          <Button
            variant="main"
            disabled={isLoading}
            onClick={() =>
              updateStatus({ submissionId: id, vote: VoteType.DOWN })
            }
          >
            No
          </Button>
        </Fragment>
      )}
      {isLoading && <span>loading..</span>}
    </Group>
  );
};

const SubmissionItem = ({ submission }: { submission: IReleaseSubmission }) => {
  const { canVoteOnSubmissions } = useAuth();

  return (
    <Stack key={submission.id}>
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
      {submission.submissionStatus === SubmissionStatus.OPEN &&
        canVoteOnSubmissions && <SubmissionActions id={submission.id} />}
    </Stack>
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
        <Stack key={page.currentPage} gap="lg">
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
