import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { FindReleasesType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import ReleasesListRenderer from '../releases/releases-list-renderer';

const GenrePage = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(
    cacheKeys.genreKey(id),
    () => api.getGenre(id!),
    {
      enabled: !!id,
    },
  );

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
      ]}
    >
      {isLoading ? <Loading /> : <div></div>}

      {genre ? (
        <Stack>
          <div
            css={{
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography size="title-xl" as="h1">
              {genre.name}
            </Typography>
            <Typography size="body" whiteSpace="pre-wrap">
              {genre.bio}
            </Typography>
          </div>
          <ReleasesListRenderer type={FindReleasesType.New} genreId={id} />
        </Stack>
      ) : (
        <div></div>
      )}
    </AppPageWrapper>
  );
};

export default GenrePage;
