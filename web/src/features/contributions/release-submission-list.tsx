import { Fragment } from 'react';
import { useInfiniteQuery } from 'react-query';
import { IReleaseSubmission, SubmissionStatus } from 'shared';
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
import { useOutletContext } from 'react-router-dom';

export class ReleaseSubmissionListOutletContext {
  status?: SubmissionStatus;
  userId?: string;
  releaseId?: string;
}

export const ReleaseSubmissionItem = ({
  submission,
}: {
  submission: IReleaseSubmission;
}) => {
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
            <div key={t.title}>
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

const ReleaseSubmissionsList = () => {
  const { userId, releaseId, status } =
    useOutletContext<ReleaseSubmissionListOutletContext>();
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.releaseSubmissionsKey({
        status,
        releaseId,
        userId,
      }),
      async ({ pageParam = 1 }) =>
        api.getReleaseSubmissions({
          page: pageParam,
          status,
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
            <ReleaseSubmissionItem submission={submission} />
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
