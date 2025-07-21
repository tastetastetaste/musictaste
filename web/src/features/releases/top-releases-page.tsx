import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';
import { FindReleasesType } from 'shared';

const TopReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.Top} />
    </ReleasesPageWrapper>
  );
};

export default TopReleasesPage;
