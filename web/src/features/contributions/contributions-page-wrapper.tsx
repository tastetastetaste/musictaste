import { Outlet, useLocation } from 'react-router-dom';
import { SubmissionSortByEnum, SubmissionStatus } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Navigation } from '../../components/nav';
import AppPageWrapper from '../../layout/app-page-wrapper';

const ContributionsPageWrapper = () => {
  const location = useLocation();

  const getCurrentStatus = () => {
    if (location.pathname.includes('/auto-approved')) {
      return SubmissionStatus.AUTO_APPROVED;
    }
    return SubmissionStatus.OPEN;
  };

  const currentStatus = getCurrentStatus();

  const getBasePath = () => {
    const path = location.pathname;
    if (path.includes('/releases')) {
      return '/contributions/releases';
    } else if (path.includes('/artists')) {
      return '/contributions/artists';
    } else if (path.includes('/labels')) {
      return '/contributions/labels';
    } else if (path.includes('/genres')) {
      return '/contributions/genres';
    }
    return '/contributions/releases';
  };

  const basePath = getBasePath();

  return (
    <AppPageWrapper>
      <Stack>
        <Navigation
          links={[
            {
              label: 'Open',
              to: `${basePath}/open`,
            },
            {
              label: 'Auto Approved',
              to: `${basePath}/auto-approved`,
            },
          ]}
        />

        <Navigation
          links={[
            {
              label: 'releases',
              to: `/contributions/releases/${currentStatus === SubmissionStatus.AUTO_APPROVED ? 'auto-approved' : 'open'}`,
            },
            {
              label: 'artists',
              to: `/contributions/artists/${currentStatus === SubmissionStatus.AUTO_APPROVED ? 'auto-approved' : 'open'}`,
            },
            {
              label: 'labels',
              to: `/contributions/labels/${currentStatus === SubmissionStatus.AUTO_APPROVED ? 'auto-approved' : 'open'}`,
            },
            {
              label: 'genres',
              to: `/contributions/genres/${currentStatus === SubmissionStatus.AUTO_APPROVED ? 'auto-approved' : 'open'}`,
            },
          ]}
        />

        <Outlet
          context={{
            status: currentStatus,
            sortBy: SubmissionSortByEnum.Oldest,
          }}
        />
      </Stack>
    </AppPageWrapper>
  );
};

export default ContributionsPageWrapper;
