import { Outlet } from 'react-router-dom';
import { SubmissionSortByEnum, SubmissionStatus } from 'shared';
import AppPageWrapper from '../../layout/app-page-wrapper';

const ContributionsPageWrapper = () => {
  return (
    <AppPageWrapper
      navigation={[
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
      hideBackButton
    >
      <Outlet
        context={{
          status: SubmissionStatus.OPEN,
          sortBy: SubmissionSortByEnum.Oldest,
        }}
      />
    </AppPageWrapper>
  );
};

export default ContributionsPageWrapper;
