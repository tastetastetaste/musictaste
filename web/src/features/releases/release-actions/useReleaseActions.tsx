import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IEntryResonse, UpdateEntryDto, VoteType } from 'shared';
import { api } from '../../../utils/api';
import { cacheKeys } from '../../../utils/cache-keys';
import { useAuth } from '../../account/useAuth';

export const useReleaseActions = (releaseId: string) => {
  const qc = useQueryClient();
  const { me } = useAuth();

  const refetchQuery = () =>
    qc.refetchQueries(cacheKeys.myReleaseEntryKey(releaseId));

  const { data: releaseData } = useQuery(
    cacheKeys.releaseKey(releaseId),
    () => api.getRelease(releaseId!),
    {
      enabled: !!releaseId,
    },
  );

  const {
    data: entryData,
    isLoading: isEntryLoading,
    refetch,
  } = useQuery(cacheKeys.myReleaseEntryKey(releaseId), () =>
    api.getMyReleaseEntry(releaseId),
  );

  const { mutateAsync: createEntryMu, isLoading: createEntryLoading } =
    useMutation(api.createEntry, {
      onSettled: refetchQuery,
    });

  const { mutateAsync: updateEntryMu, isLoading: updateEntryLoading } =
    useMutation(api.updateEntry, {
      onSettled: refetchQuery,
    });

  const { mutateAsync: removeEntryMu, isLoading: removeEntryLoading } =
    useMutation(api.removeEntry, {
      onSettled: refetchQuery,
    });

  const createEntry = async () => {
    const data = await createEntryMu({
      releaseId,
    });
    await refetch();
    qc.invalidateQueries(cacheKeys.entriesKey({}));
    return data.data?.createEntry;
  };

  const removeEntry = async () => {
    if (entryData) await removeEntryMu(entryData.entry.id);
    qc.invalidateQueries(cacheKeys.entriesKey({}));
    qc.invalidateQueries(cacheKeys.entriesKey({ withReview: true }));
  };

  const updateEntry = async (overrides: Partial<UpdateEntryDto>) => {
    if (entryData.entry) {
      await updateEntryMu({
        id: entryData.entry.id,
        rating: entryData.entry.rating?.rating,
        review: entryData.entry.review?.body,
        tags: entryData.entry.tags?.map((t) => t.id),
        ...overrides,
      });
    }
  };

  const ratingAction = async (value?: number) => {
    if (entryData.entry) {
      await updateEntry({ rating: value });
    } else if (typeof value === 'number') {
      await createEntryMu({ releaseId, rating: value });
    }
    qc.invalidateQueries(cacheKeys.entriesKey({}));
    qc.invalidateQueries(cacheKeys.entriesKey({ withReview: true }));
  };

  const reviewAction = async (body?: string) => {
    if (entryData.entry) {
      await updateEntry({ review: body });
    } else if (body) {
      await createEntryMu({ releaseId, review: body });
    }
    // invalidate all reviews
    qc.invalidateQueries(
      cacheKeys.entriesKey({
        withReview: true,
      }),
    );
  };

  const tagsAction = async (tagIds?: string[]) => {
    if (entryData.entry) {
      await updateEntry({ tags: tagIds });
    } else if (tagIds) {
      await createEntryMu({ releaseId, tags: tagIds });
    }
    // clear user entries
    qc.invalidateQueries(
      cacheKeys.entriesKey({
        userId: me.username,
      }),
    );

    // clear user tags
    qc.invalidateQueries(cacheKeys.userTagsKey(me.id));
  };

  const { mutateAsync: trackVote } = useMutation(api.trackVote, {
    onSuccess: (newTrackVote) => {
      // update the entry
      qc.setQueryData<IEntryResonse>(cacheKeys.myReleaseEntryKey(releaseId), {
        entry: {
          ...entryData.entry,
          trackVotes: [...entryData.entry.trackVotes, newTrackVote],
        },
      });

      // update release tracks data
      qc.setQueryData(cacheKeys.releaseKey(releaseId), {
        ...releaseData,
        tracks: releaseData.tracks.map((t) => ({
          ...t,
          upvotes:
            newTrackVote.vote === VoteType.UP && newTrackVote.trackId === t.id
              ? Number(t.upvotes) + 1
              : t.upvotes,
          downvotes:
            newTrackVote.vote === VoteType.DOWN && newTrackVote.trackId === t.id
              ? Number(t.downvotes) + 1
              : t.downvotes,
        })),
      });

      // invalidate entry
      qc.invalidateQueries(cacheKeys.entryKey(newTrackVote.userReleaseId));
    },
  });

  const { mutateAsync: removeTrackVote } = useMutation(api.removeTrackVote, {
    onSuccess: (_, variables) => {
      // update the entry
      qc.setQueryData<IEntryResonse>(cacheKeys.myReleaseEntryKey(releaseId), {
        entry: {
          ...entryData.entry,
          trackVotes: entryData.entry.trackVotes.filter(
            (v) => v.trackId !== variables.trackId,
          ),
        },
      });
      // update release tracks data
      qc.setQueryData(cacheKeys.releaseKey(releaseId), {
        ...releaseData,
        tracks: releaseData.tracks.map((t) => ({
          ...t,
          upvotes:
            entryData.entry.trackVotes.some(
              (t) => t.trackId === variables.trackId && t.vote === VoteType.UP,
            ) && variables.trackId === t.id
              ? Number(t.upvotes) - 1
              : t.upvotes,
          downvotes:
            entryData.entry.trackVotes.some(
              (t) =>
                t.trackId === variables.trackId && t.vote === VoteType.DOWN,
            ) && variables.trackId === t.id
              ? Number(t.downvotes) - 1
              : t.downvotes,
        })),
      });

      // invalidate entry
      qc.invalidateQueries(cacheKeys.entryKey(entryData.entry.id));
    },
  });

  return {
    createEntry,
    removeEntry,
    ratingAction,
    reviewAction,
    tagsAction,
    createEntryLoading,
    removeEntryLoading,
    entry: entryData ? entryData.entry : undefined,
    isEntryLoading,
    updateEntryLoading,
    refetchQuery,
    trackVote,
    removeTrackVote,
  };
};
