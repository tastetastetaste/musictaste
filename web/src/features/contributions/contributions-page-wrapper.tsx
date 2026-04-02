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
              label: 'Releases',
              to: `/contributions/releases`,
            },
            {
              label: 'Artists',
              to: `/contributions/artists`,
            },
            {
              label: 'Labels',
              to: `/contributions/labels`,
            },
            {
              label: 'Genres',
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
