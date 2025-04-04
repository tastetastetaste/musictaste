import { api } from '../../utils/api';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { ArtistSubmissionsList } from '../contributions/artist-submission-list';
import { cacheKeys } from '../../utils/cache-keys';

const UserContributionsArtistsPage = () => {
  const { username } = useParams();

  const { data, isLoading } = useQuery(
    cacheKeys.userProfileKey(username),
    () => api.getUserProfile(username!),
    {
      enabled: !!username,
    },
  );

  if (isLoading || !data) {
    return <Loading />;
  }

  return <ArtistSubmissionsList userId={data.user.id} />;
};

export default UserContributionsArtistsPage;
