import { useQuery } from '@tanstack/react-query';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { getGenrePath } from 'shared';
import { useMemo, useState } from 'react';
import { Group } from '../../components/flex/group';
import { IconButton } from '../../components/icon-button';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { Stack } from '../../components/flex/stack';

const GenreItem = ({ genre }) => {
  const [expand, setExpand] = useState(false);

  return (
    <div
      css={(theme) => ({
        minHeight: '30px',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        backgroundColor: theme.colors.background_sub,
        paddingLeft: '6px',
        paddingRight: '6px',
        borderRadius: theme.border_radius.base,
      })}
    >
      <Stack justify="center">
        <Group>
          {genre.children.length > 0 && (
            <IconButton onClick={() => setExpand(!expand)} title="test">
              {expand ? (
                <IconChevronDown size={18} />
              ) : (
                <IconChevronRight size={18} />
              )}
            </IconButton>
          )}
          <Typography key={genre.id}>
            <Link to={getGenrePath({ genreId: genre.id })}>{genre.name}</Link>
          </Typography>
        </Group>
        {expand && genre.children.length > 0 && (
          <Stack>
            {genre.children.map((child) => (
              <GenreItem key={child.id} genre={child} />
            ))}
          </Stack>
        )}
      </Stack>
    </div>
  );
};

const GenresPage = () => {
  const { data, isLoading } = useQuery(cacheKeys.genresKey(), () =>
    api.getGenres(),
  );

  const genres = useMemo(() => {
    if (!data?.genres) return [];

    // build parent-> child tree

    const genresMap = new Map<string, any>();
    for (const genre of data.genres) {
      genresMap.set(genre.id, { ...genre, children: [] });
    }
    const topLevelGenres = [];
    for (const genre of genresMap.values()) {
      if (genre.parentIds && genre.parentIds.length > 0) {
        for (const parentId of genre.parentIds) {
          const parent = genresMap.get(parentId);
          if (parent) {
            parent.children.push(genre);
          }
        }
      } else {
        topLevelGenres.push(genre);
      }
    }

    return topLevelGenres;
  }, [data]);

  if (isLoading) {
    return (
      <AppPageWrapper title="Genres">
        <Loading />
      </AppPageWrapper>
    );
  }

  return (
    <AppPageWrapper title="Genres" hideBackButton>
      {genres.length > 0 ? (
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
          }}
        >
          {genres.map((genre) => (
            <GenreItem key={genre.id} genre={genre} />
          ))}
        </div>
      ) : (
        <Feedback message="There are no genres" />
      )}
    </AppPageWrapper>
  );
};

export default GenresPage;
