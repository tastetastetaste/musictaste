import {
  IconArrowBigDown,
  IconArrowBigUp,
  IconPencil,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import removeMarkdown from 'remove-markdown';
import { IReleaseGenre, VoteType } from 'shared';
import { Dialog } from '../../components/dialog';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';
import { SelectGenres } from '../genres/select-genres';
import { User } from '../users/user';

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
          css={(theme) =>
            !appliedToRelease
              ? {
                  color: theme.colors.error,
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

  const {
    data,
    refetch,
    isLoading: rgLoading,
  } = useQuery(cacheKeys.releaseGenresKey(releaseId), () =>
    api.getReleaseGenres(releaseId),
  );

  const { mutateAsync: vote } = useMutation(api.createReleaseGenreVote, {
    onSettled: refetch,
  });
  const { mutateAsync: removeVote } = useMutation(api.removeReleaseGenreVote, {
    onSettled: refetch,
  });

  return (
    <div>
      {rgLoading && <Loading />}

      {data && (
        <Fragment>
          <div style={{ paddingBottom: '16px' }}>
            <SelectGenres
              onChange={(genreId: string) =>
                vote({
                  releaseId,
                  genreId,
                  voteType: VoteType.UP,
                })
              }
              filter={(genreId) => !data.some((rg) => rg.genre.id === genreId)}
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
