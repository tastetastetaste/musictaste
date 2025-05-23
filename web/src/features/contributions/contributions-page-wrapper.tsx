import { Outlet } from 'react-router-dom';
import { Feedback } from '../../components/feedback';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Navigation } from '../../components/nav';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { useAuth } from '../account/useAuth';
import { SubmissionStatus } from 'shared';

const ContributionsPageWrapper = () => {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AppPageWrapper>
      <Stack gap={10}>
        <Typography>Contributions</Typography>
        <Navigation
          links={[
            { label: 'releases', to: `/contributions/releases` },
            {
              label: 'artists',
              to: `/contributions/artists`,
            },
            {
              label: 'labels',
              to: `/contributions/labels`,
            },
          ]}
        />
        {isLoggedIn ? (
          <Outlet context={{ status: SubmissionStatus.OPEN }} />
        ) : (
          <Feedback message="Please login to access this page" />
        )}
      </Stack>
    </AppPageWrapper>
  );
};

export default ContributionsPageWrapper;
