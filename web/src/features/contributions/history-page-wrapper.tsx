import { Outlet, useParams } from 'react-router-dom';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SubmissionSortByEnum } from 'shared';

const HistoryPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const pathname = window.location.pathname;

  let outletContext: any = {};

  if (pathname.includes('/history/release/')) {
    outletContext = { releaseId: id };
  } else if (pathname.includes('/history/artist/')) {
    outletContext = { artistId: id };
  } else if (pathname.includes('/history/label/')) {
    outletContext = { labelId: id };
  }

  return (
    <AppPageWrapper>
      <Outlet
        context={{ ...outletContext, sortBy: SubmissionSortByEnum.Newest }}
      />
    </AppPageWrapper>
  );
};

export default HistoryPageWrapper;
