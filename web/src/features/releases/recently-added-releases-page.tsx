import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';
import { FindReleasesType } from 'shared';

const RecentlyAddedReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.RecentlyAdded} />
    </ReleasesPageWrapper>
  );
};

export default RecentlyAddedReleasesPage;
