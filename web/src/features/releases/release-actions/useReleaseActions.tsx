import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IEntryResonse, UpdateEntryDto, VoteType } from 'shared';
import { api } from '../../../utils/api';
import { cacheKeys } from '../../../utils/cache-keys';
import { useAuth } from '../../account/useAuth';

export const useReleaseActions = (releaseId: string) => {
  const qc = useQueryClient();
  const { me } = useAuth();

  const refetchQueries = () => {
    qc.refetchQueries(cacheKeys.myReleaseEntryKey(releaseId));
    qc.invalidateQueries(cacheKeys.entriesKey({ userId: me.id }));
  };

  const { data: entryData, isLoading: isEntryLoading } = useQuery(
    cacheKeys.myReleaseEntryKey(releaseId),
    () => api.getMyReleaseEntry(releaseId),
  );

  const { mutateAsync: createEntryMu, isLoading: createEntryLoading } =
    useMutation(api.createEntry, {
      onSettled: refetchQueries,
    });

  const { mutateAsync: updateEntryMu, isLoading: updateEntryLoading } =
    useMutation(api.updateEntry, {
      onSettled: refetchQueries,
    });

  const { mutateAsync: removeEntryMu, isLoading: removeEntryLoading } =
    useMutation(api.removeEntry, {
      onSettled: refetchQueries,
    });

  const createEntry = async () => {
    const data = await createEntryMu({
      releaseId,
    });
    return data.data?.createEntry;
  };

  const removeEntry = async () => {
    if (entryData) await removeEntryMu(entryData.entry.id);
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
  };

  const reviewAction = async (body?: string) => {
    if (entryData.entry) {
      await updateEntry({ review: body });
    } else if (body) {
      await createEntryMu({ releaseId, review: body });
    }
  };

  const tagsAction = async (tagIds?: string[]) => {
    if (entryData.entry) {
      await updateEntry({ tags: tagIds });
    } else if (tagIds) {
      await createEntryMu({ releaseId, tags: tagIds });
    }
    // Update user tags release count
    qc.invalidateQueries(cacheKeys.userTagsKey(me.id));
  };

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
  };
};

export const useReleaseTrackActions = (releaseId: string) => {
  const qc = useQueryClient();
  const { data: releaseData } = useQuery(
    cacheKeys.releaseKey(releaseId),
    () => api.getRelease(releaseId!),
    {
      enabled: !!releaseId,
    },
  );

  const { createEntry, createEntryLoading, entry, isEntryLoading } =
    useReleaseActions(releaseId);

  const { mutateAsync: trackVote } = useMutation(api.trackVote, {
    onSuccess: (newTrackVote) => {
      // update the entry
      qc.setQueryData<IEntryResonse>(cacheKeys.myReleaseEntryKey(releaseId), {
        entry: {
          ...entry,
          trackVotes: [...entry.trackVotes, newTrackVote],
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
          ...entry,
          trackVotes: entry.trackVotes.filter(
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
            entry.trackVotes.some(
              (t) => t.trackId === variables.trackId && t.vote === VoteType.UP,
            ) && variables.trackId === t.id
              ? Number(t.upvotes) - 1
              : t.upvotes,
          downvotes:
            entry.trackVotes.some(
              (t) =>
                t.trackId === variables.trackId && t.vote === VoteType.DOWN,
            ) && variables.trackId === t.id
              ? Number(t.downvotes) - 1
              : t.downvotes,
        })),
      });

      // invalidate entry
      qc.invalidateQueries(cacheKeys.entryKey(entry.id));
    },
  });

  return {
    createEntry,
    createEntryLoading,
    entry,
    isEntryLoading,
    trackVote,
    removeTrackVote,
  };
};
