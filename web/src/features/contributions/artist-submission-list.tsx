import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArtistType,
  ArtistVisibility,
  getArtistPath,
  IArtistSubmission,
  SubmissionSortByEnum,
  SubmissionStatus,
  SubmissionType,
} from 'shared';
import { FetchMore } from '../../components/fetch-more';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { SubmissionField, SubmissionItemWrapper } from './submission-item';

class ArtistSubmissionListOutletContext {
  status?: SubmissionStatus;
  type?: SubmissionType;
  userId?: string;
  artistId?: string;
  voteByUserId?: string;
  sortBy?: SubmissionSortByEnum;
}

interface ArtistSubmissionItemProps {
  submission: IArtistSubmission;
  hideUser?: boolean;
  fullPage?: boolean;
  onUpdate?: (submission: IArtistSubmission) => void;
}

export const ArtistSubmissionItem = ({
  submission,
  hideUser,
  fullPage,
  onUpdate,
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
      submission={submission}
      submissionType="artist"
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
        label="Name (Latin)"
        originalValue={original?.nameLatin}
        changedValue={changes?.nameLatin}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Type"
        originalValue={original?.type}
        changedValue={changes?.type}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{ArtistType[v]}</span>}
      />
      <SubmissionField
        label="Visibility"
        originalValue={original?.visibility}
        changedValue={changes?.visibility}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{ArtistVisibility[v]}</span>}
      />
      <SubmissionField
        label="Main Artist"
        originalValue={original?.mainArtist}
        changedValue={changes?.mainArtist}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v?.name}</span>}
      />
      <SubmissionField
        label="Disambiguation"
        originalValue={original?.disambiguation}
        changedValue={changes?.disambiguation}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v}</span>}
      />
      <SubmissionField
        label="Country"
        originalValue={original?.country}
        changedValue={changes?.country}
        showOriginal={hasOriginal}
        renderValue={(v) => <span>{v?.name}</span>}
      />
      <SubmissionField
        label="Group Artists"
        originalValue={original?.groupArtists?.sort((a, b) =>
          a?.artist?.name.localeCompare(b?.artist?.name),
        )}
        changedValue={changes?.groupArtists?.sort((a, b) =>
          a?.artist?.name.localeCompare(b?.artist?.name),
        )}
        showOriginal={hasOriginal}
        renderValue={(value) => (
          <span>
            {value
              .map(
                (a) =>
                  a?.artist?.name +
                  (a?.artist?.nameLatin ? ` [${a?.artist?.nameLatin}]` : '') +
                  (!a?.current ? ' (former)' : ''),
              )
              .join(', ')}
          </span>
        )}
      />

      {(typeof changes?.relatedArtists === 'object' ||
        typeof original?.relatedArtists === 'object') && (
        <SubmissionField
          label="Related Artists"
          originalValue={
            typeof original?.relatedArtists === 'object'
              ? original?.relatedArtists?.sort((a, b) =>
                  a?.name.localeCompare(b?.name),
                )
              : undefined
          }
          changedValue={
            typeof changes?.relatedArtists === 'object'
              ? changes?.relatedArtists?.sort((a, b) =>
                  a?.name.localeCompare(b?.name),
                )
              : undefined
          }
          showOriginal={hasOriginal}
          renderValue={(value) => (
            <span>
              {value
                .map(
                  (a) => a?.name + (a?.nameLatin ? ` [${a?.nameLatin}]` : ''),
                )
                .join(', ')}
            </span>
          )}
        />
      )}
      {/* TODO: remove deprecated fields */}
      {/* @ts-ignore */}
      {(typeof changes?.members === 'string' ||
        // @ts-ignore
        typeof original?.members === 'string') && (
        <SubmissionField
          label="Members (deprecated)"
          // @ts-ignore
          originalValue={original?.members}
          // @ts-ignore
          changedValue={changes?.members}
          showOriginal={hasOriginal}
          renderValue={(v) => <Markdown variant="compact">{v}</Markdown>}
        />
      )}
      {(typeof changes?.relatedArtists === 'string' ||
        typeof original?.relatedArtists === 'string') && (
        <SubmissionField
          label="Related Artists (deprecated)"
          originalValue={
            typeof original?.relatedArtists === 'string'
              ? original?.relatedArtists
              : undefined
          }
          changedValue={
            typeof changes?.relatedArtists === 'string'
              ? changes?.relatedArtists
              : undefined
          }
          showOriginal={hasOriginal}
          renderValue={(v) => <Markdown variant="compact">{v}</Markdown>}
        />
      )}
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
  const { status, type, artistId, userId, voteByUserId, sortBy } =
    useOutletContext<ArtistSubmissionListOutletContext>();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.artistSubmissionsKey({
        status,
        type,
        artistId,
        userId,
        voteByUserId,
        sortBy,
      }),
      async ({ pageParam = 1 }) =>
        api.getArtistSubmissions({
          page: pageParam,
          status,
          type,
          artistId,
          userId,
          voteByUserId,
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

  const handleUpdateAfterVote = (submission: IArtistSubmission) => {
    queryClient.setQueryData(
      cacheKeys.artistSubmissionsKey({
        status,
        artistId,
        userId,
        sortBy,
      }),
      (oldData: any) => {
        const pages = oldData?.pages?.map((page: any) => {
          const artists = page.artists?.map((artistSubmission: any) => {
            if (artistSubmission.id === submission.id) {
              return {
                ...artistSubmission,
                submissionStatus: submission.submissionStatus,
                votes: submission.votes,
              };
            }
            return artistSubmission;
          });
          return {
            ...page,
            artists,
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
          {page.artists.map((submission) => (
            <ArtistSubmissionItem
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

export default ArtistSubmissionsList;
