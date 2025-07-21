import ReleasesPageWrapper from './releases-page-wrapper';
import ReleasesListRenderer from './releases-list-renderer';
import { FindReleasesType } from 'shared';

const PopularReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.Popular} />
    </ReleasesPageWrapper>
  );
};

export default PopularReleasesPage;
