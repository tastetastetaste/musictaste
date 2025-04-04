import ReleasesListRenderer from './releases-list-renderer';
import ReleasesPageWrapper from './releases-page-wrapper';

const NewReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer releasesFor="new" />
    </ReleasesPageWrapper>
  );
};

export default NewReleasesPage;
