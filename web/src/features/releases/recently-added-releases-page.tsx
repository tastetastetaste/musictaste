import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';

const RecentlyAddedReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer releasesFor="recently-added" />
    </ReleasesPageWrapper>
  );
};

export default RecentlyAddedReleasesPage;
