import { api } from '../../utils/api';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/loading';
import { LabelSubmissionsList } from '../contributions/label-submission-list';
import { cacheKeys } from '../../utils/cache-keys';

const UserContributionsLabelsPage = () => {
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

  return <LabelSubmissionsList userId={data.user.id} />;
};

export default UserContributionsLabelsPage;
