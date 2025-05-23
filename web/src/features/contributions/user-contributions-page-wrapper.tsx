import { Outlet, useParams } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { Navigation } from '../../components/nav';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { useAuth } from '../account/useAuth';
import { Loading } from '../../components/loading';
import { Feedback } from '../../components/feedback';
import { Typography } from '../../components/typography';
import { useQuery } from 'react-query';
import { cacheKeys } from '../../utils/cache-keys';
import { api } from '../../utils/api';

const UserContributionsPageWrapper = () => {
  const { username } = useParams();

  const { isLoading, isLoggedIn } = useAuth();

  const { data, isLoading: isLoading2 } = useQuery(
    cacheKeys.userProfileKey(username),
    () => api.getUserProfile(username!),
    {
      enabled: !!username,
    },
  );

  if (isLoading || isLoading2 || !data) {
    return <Loading />;
  }

  return (
    <AppPageWrapper>
      <Stack gap={10}>
        <Typography>{`@${username}'s contributions`}</Typography>
        <Navigation
          links={[
            { label: 'releases', to: `/${username}/contributions/releases` },
            {
              label: 'artists',
              to: `/${username}/contributions/artists`,
            },
            {
              label: 'labels',
              to: `/${username}/contributions/labels`,
            },
          ]}
        />
        {isLoggedIn ? (
          <Outlet context={{ userId: data.user.id }} />
        ) : (
          <Feedback message="Please login to access this page" />
        )}
      </Stack>
    </AppPageWrapper>
  );
};

export default UserContributionsPageWrapper;
