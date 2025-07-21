import { FindReleasesType } from 'shared';
import ReleasesListRenderer from './releases-list-renderer';
import ReleasesPageWrapper from './releases-page-wrapper';

const UpcomingReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.Upcoming} />
    </ReleasesPageWrapper>
  );
};

export default UpcomingReleasesPage;
