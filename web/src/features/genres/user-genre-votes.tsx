import { useTheme } from '@emotion/react';
import { IconArrowBigDown, IconArrowBigUp } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { VoteType } from 'shared';
import { Button } from '../../components/button';
import { FetchMore } from '../../components/fetch-more';
import { Group } from '../../components/flex/group';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { Stack } from '../../components/flex/stack';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ReleaseSearchLink } from '../search/search-links';
import { SelectGenres } from './select-genres';

const UserGenreVotes = () => {
  const { userId } = useOutletContext<any>();

  const [genreId, setGenreId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('genreId') || '';
  });

  const smallScreen = useMediaQuery({ down: 'sm' });

  const theme = useTheme();

  const navigate = useNavigate();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.userGenreVotesKey(userId, 1, genreId),
      ({ pageParam = 1 }) =>
        api.getUserGenreVotes(userId, { page: pageParam, genreId }),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  const groupedVotes = useMemo(() => {
    const allVotes = data?.pages.flatMap((page) => page.votes) || [];
    const grouped = [];

    for (const vote of allVotes) {
      if (
        grouped.length > 0 &&
        grouped[grouped.length - 1].releaseId === vote.release.id
      ) {
        grouped[grouped.length - 1].votes.push(vote);
      } else {
        grouped.push({
          releaseId: vote.release.id,
          release: vote.release,
          votes: [vote],
        });
      }
    }

    return grouped;
  }, [data?.pages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (genreId) {
      params.set('genreId', genreId);
    } else {
      params.delete('genreId');
    }

    navigate(`?${params.toString()}`, { replace: true });
  }, [genreId]);

  return (
    <Fragment>
      <Group align="center" justify="start" gap="md">
        <div
          css={{
            width: 300,
            maxWidth: '100%',
          }}
        >
          <SelectGenres
            value={genreId}
            onChange={(value: string) => setGenreId(value)}
          />
        </div>
        {genreId && (
          <Button onClick={() => setGenreId(undefined)}>Clear</Button>
        )}
      </Group>
      <Stack gap="lg">
        {groupedVotes.map((group) => (
          <ResponsiveRow key={`${group.releaseId}`} gap="md" breakpoint="sm">
            <div
              css={{
                maxWidth: smallScreen ? '100%' : 300,
                minWidth: 300,
              }}
            >
              <ReleaseSearchLink release={group.release} />
            </div>
            <Group gap="md" wrap>
              {group.votes.map((vote) => (
                <Group gap="sm" align="center" key={vote.id}>
                  <span
                    css={
                      vote.votesAvg > 0
                        ? {
                            fontWeight: 'bold',
                          }
                        : {
                            color: theme.colors.error,
                            textDecoration: 'line-through',
                            fontWeight: 'bold',
                          }
                    }
                  >
                    {vote.genre.name}
                  </span>
                  {vote.type === VoteType.UP ? (
                    <IconArrowBigUp color={theme.colors.primary} />
                  ) : (
                    <IconArrowBigDown color={theme.colors.error} />
                  )}
                </Group>
              ))}
            </Group>
          </ResponsiveRow>
        ))}
      </Stack>
      {hasNextPage && <FetchMore handleFetchMore={fetchNextPage} />}
    </Fragment>
  );
};

export default UserGenreVotes;
