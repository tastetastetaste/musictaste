import { useQuery } from '@tanstack/react-query';
import { Feedback } from '../../components/feedback';
import { Loading } from '../../components/loading';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { getGenrePath } from 'shared';

const GenresPage = () => {
  const { data, isLoading } = useQuery(
    cacheKeys.genresKey(),
    () => api.getGenres(),
  );

  if (isLoading) {
    return (
      <AppPageWrapper title="Genres">
        <Loading />
      </AppPageWrapper>
    );
  }

  return (
    <AppPageWrapper title="Genres">
      {data && data.genres.length > 0 ? (
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {data.genres.map((genre) => (
            <Typography key={genre.id}>
              <Link to={getGenrePath({ genreId: genre.id })}>
                {genre.name}
              </Link>
            </Typography>
          ))}
        </div>
      ) : (
        <Feedback message="There are no genres" />
      )}
    </AppPageWrapper>
  );
};

export default GenresPage;
