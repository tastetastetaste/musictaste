import {
  IconArrowBigDown,
  IconArrowBigUp,
  IconPencil,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { IReleaseGenre, VoteType, GENRE_REFERENCE_PATTERN } from 'shared';
import { Dialog } from '../../components/dialog';
import { Group } from '../../components/flex/group';
import { IconButton } from '../../components/icon-button';
import { Select } from '../../components/inputs/select';
import { Loading } from '../../components/loading';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';
import { User } from '../users/user';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import removeMarkdown from 'remove-markdown';

type VoteFuT = typeof api.createReleaseGenreVote;
type RemoveVoteFuT = typeof api.removeReleaseGenreVote;

type ReleaseGenreItemProps = {
  me: any;
  releaseId: string;
  releaseGenre: IReleaseGenre;
  vote: VoteFuT;
  removeVote: RemoveVoteFuT;
};

const ReleaseGenreItem: React.FC<ReleaseGenreItemProps> = ({
  me,
  releaseId,
  releaseGenre: { id, genre, genreVotes },
  vote,
  removeVote,
}) => {
  const myVote = genreVotes && genreVotes.find((gv) => gv.userId === me.id);

  const votesUpCount =
    genreVotes && genreVotes.filter((gv) => gv.type === 1).length;
  const votesDownCount =
    genreVotes && genreVotes.filter((gv) => gv.type === -1).length;

  const appliedToRelease =
    typeof votesUpCount === 'number' &&
    typeof votesDownCount === 'number' &&
    votesUpCount > votesDownCount
      ? true
      : false;

  return (
    <Fragment>
      <Stack gap="sm">
        <span
          style={
            !appliedToRelease
              ? {
                  color: 'red',
                  textDecoration: 'line-through',
                  fontWeight: 'bold',
                }
              : {
                  fontWeight: 'bold',
                }
          }
        >
          {genre.name}
        </span>
        <Typography size="small">{removeMarkdown(genre.bio)}</Typography>
      </Stack>
      <Group justify="apart">
        <Group wrap gap="sm">
          {genreVotes &&
            genreVotes
              .filter((gv) => gv.type === VoteType.UP)
              .map((gv) => <User key={gv.userId} user={gv.user} avatarOnly />)}
        </Group>
        <Group gap="sm">
          <IconButton
            title="Upvote"
            active={Boolean(myVote && myVote.type === VoteType.UP)}
            onClick={() =>
              myVote
                ? removeVote({ id })
                : vote({
                    genreId: genre.id,
                    releaseId,
                    voteType: VoteType.UP,
                  })
            }
          >
            <IconArrowBigUp />
          </IconButton>
          <span>{votesUpCount}</span>
        </Group>
      </Group>
      <Group justify="apart">
        <Group wrap gap={10}>
          {genreVotes &&
            genreVotes
              .filter((gv) => gv.type === VoteType.DOWN)
              .map((gv) => <User key={gv.userId} user={gv.user} avatarOnly />)}
        </Group>
        <Group gap={5}>
          <IconButton
            title="Downvote"
            active={Boolean(myVote && myVote.type === VoteType.DOWN)}
            onClick={() =>
              myVote
                ? removeVote({ id })
                : vote({
                    genreId: genre.id,
                    releaseId,
                    voteType: VoteType.DOWN,
                  })
            }
          >
            <IconArrowBigDown />
          </IconButton>
          <span>{votesDownCount}</span>
        </Group>
      </Group>
    </Fragment>
  );
};

const DialogContent = ({ releaseId }: { releaseId: string }) => {
  const { me } = useAuth();
  const queryClient = useQueryClient();
  const { snackbar } = useSnackbar();

  const [query, setQuery] = useState('');

  const {
    data,
    refetch,
    isLoading: rgLoading,
  } = useQuery(cacheKeys.releaseGenresKey(releaseId), () =>
    api.getReleaseGenres(releaseId),
  );

  const {
    data: searchData,
    isLoading,
    fetchStatus,
  } = useQuery(
    cacheKeys.searchKey({
      q: query!,
      type: ['genres'],
      page: 1,
      pageSize: 12,
    }),
    () =>
      api.search({
        q: query!,
        type: ['genres'],
        page: 1,
        pageSize: 12,
      }),
    { enabled: !!query },
  );

  const { mutateAsync: vote } = useMutation(api.createReleaseGenreVote, {
    onSettled: refetch,
  });
  const { mutateAsync: removeVote } = useMutation(api.removeReleaseGenreVote, {
    onSettled: refetch,
  });

  const handleInputChange = (v: any) => {
    const match = v.match(GENRE_REFERENCE_PATTERN);
    if (match) {
      const genreId = match[1];
      setQuery('');

      queryClient
        .fetchQuery(cacheKeys.genreKey(genreId), () => api.getGenre(genreId))
        .then(({ genre }) => {
          vote({
            releaseId,
            genreId: genre.id,
            voteType: VoteType.UP,
          });
        })
        .catch(() => {
          snackbar('Failed to select genre');
        });
    } else {
      setQuery(v);
    }
  };

  return (
    <div>
      {rgLoading && <Loading />}

      {data && (
        <Fragment>
          <div style={{ paddingBottom: '16px' }}>
            <Select
              name="genreSelect"
              value={null}
              onChange={(selected: { value: string; label: string }) => {
                if (!selected) return;
                vote({
                  releaseId,
                  genreId: selected.value,
                  voteType: VoteType.UP,
                });
                setQuery('');
              }}
              isLoading={isLoading && fetchStatus !== 'idle'}
              isMulti={false}
              options={
                searchData?.genres &&
                searchData.genres
                  .filter((sg) => !data.some((rg) => sg.id === rg.genre.id))
                  .map((g) => ({
                    value: g.id,
                    label: g.name,
                  }))
              }
              placeholder="Release Genre"
              inputValue={query}
              onInputChange={handleInputChange}
            />
          </div>
          <div css={{ maxHeight: '300px', overflowY: 'auto' }}>
            {data.map((rg) => (
              <ReleaseGenreItem
                key={rg.id}
                releaseGenre={rg}
                releaseId={releaseId}
                me={me}
                vote={vote}
                removeVote={removeVote}
              />
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};

const ReleaseGenreVote = ({ releaseId }: any) => {
  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <IconButton title="Edit" onClick={() => setOpen(true)}>
        <IconPencil />
      </IconButton>
      <Dialog title="Primary Genres" isOpen={open} onClose={closeDialog}>
        <DialogContent releaseId={releaseId} />
      </Dialog>
    </Fragment>
  );
};

export default ReleaseGenreVote;
