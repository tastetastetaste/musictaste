import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';

const PopularReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer releasesFor="popular" />
    </ReleasesPageWrapper>
  );
};

export default PopularReleasesPage;
