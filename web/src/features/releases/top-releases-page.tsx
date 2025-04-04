import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';

const TopReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer releasesFor="top" />
    </ReleasesPageWrapper>
  );
};

export default TopReleasesPage;
