import AppPageWrapper from '../../layout/app-page-wrapper';
import { Outlet } from 'react-router-dom';

const ReleasesPageWrapper: React.FC = () => {
  return (
    <AppPageWrapper
      title="Releases"
      navigation={[
        { to: `/releases/new`, label: 'New' },
        { to: `/releases/upcoming`, label: 'Upcoming' },
        { to: `/releases/popular`, label: 'Popular' },
        { to: `/releases/top`, label: 'Top OAT' },
        { to: `/releases/top-oty`, label: 'Top OTY' },
        { to: `/releases/recently-added`, label: 'Recently added' },
      ]}
    >
      <Outlet />
    </AppPageWrapper>
  );
};

export default ReleasesPageWrapper;
