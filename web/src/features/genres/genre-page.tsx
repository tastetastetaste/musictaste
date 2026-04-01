import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FindReleasesType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import ReleasesListRenderer from '../releases/releases-list-renderer';
import { Markdown } from '../../components/markdown';
import { Group } from '../../components/flex/group';
import { Button } from '../../components/button';
import { useState } from 'react';

const GenrePage = () => {
  const { id } = useParams();

  const { snackbar } = useSnackbar();

  const { data, isLoading } = useQuery(
    cacheKeys.genreKey(id),
    () => api.getGenre(id!),
    {
      enabled: !!id,
    },
  );

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [includeCommunity, setIncludeCommunity] = useState(
    searchParams.get('includeCommunity') === 'true',
  );

  const toggleIncludeCommunity = () => {
    setIncludeCommunity(!includeCommunity);
    const newSearchParams = new URLSearchParams();
    if (!includeCommunity) {
      newSearchParams.set('includeCommunity', 'true');
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const genre = data && data.genre;

  return (
    <AppPageWrapper
      title={genre ? genre.name : ''}
      menu={[
        {
          label: 'Edit',
          to: '/contributions/genres/' + genre?.id,
        },
        {
          label: 'History',
          to: '/history/genre/' + genre?.id,
        },

        {
          label: 'Copy Reference',
          action: () => {
            navigator.clipboard.writeText(`[[genre/${genre?.id}]]`);
            snackbar('Reference copied to clipboard');
          },
        },
      ]}
    >
      {isLoading ? <Loading /> : <div></div>}

      {genre ? (
        <Stack>
          <div
            css={{
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '10px 0',
            }}
          >
            <Typography size="title-xl" as="h1">
              {genre.name}
            </Typography>
            {genre.bio ? <Markdown>{genre.bio}</Markdown> : null}
            <Group justify="end">
              <Button variant="main" onClick={toggleIncludeCommunity}>
                {includeCommunity
                  ? 'Hide Community Releases'
                  : 'Show Community Releases'}
              </Button>
            </Group>
          </div>
          <ReleasesListRenderer
            type={FindReleasesType.New}
            genreId={id}
            includeCommunity={includeCommunity}
          />
        </Stack>
      ) : (
        <div></div>
      )}
    </AppPageWrapper>
  );
};

export default GenrePage;
