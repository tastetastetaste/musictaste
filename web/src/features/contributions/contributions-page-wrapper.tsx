import { Outlet } from 'react-router-dom';
import { SubmissionSortByEnum, SubmissionStatus } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Navigation } from '../../components/nav';
import AppPageWrapper from '../../layout/app-page-wrapper';

const ContributionsPageWrapper = () => {
  return (
    <AppPageWrapper>
      <Stack>
        <Navigation
          links={[
            {
              label: 'releases',
              to: `/contributions/releases`,
            },
            {
              label: 'artists',
              to: `/contributions/artists`,
            },
            {
              label: 'labels',
              to: `/contributions/labels`,
            },
            {
              label: 'genres',
              to: `/contributions/genres`,
            },
          ]}
        />

        <Outlet
          context={{
            status: SubmissionStatus.OPEN,
            sortBy: SubmissionSortByEnum.Oldest,
          }}
        />
      </Stack>
    </AppPageWrapper>
  );
};

export default ContributionsPageWrapper;
