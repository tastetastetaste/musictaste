import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';
import { FindReleasesType } from 'shared';

const TopReleasesOtyPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.TopOTY} />
    </ReleasesPageWrapper>
  );
};

export default TopReleasesOtyPage;
