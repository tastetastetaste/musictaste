import { FindReleasesType } from 'shared';
import ReleasesListRenderer from './releases-list-renderer';
import ReleasesPageWrapper from './releases-page-wrapper';

const NewReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.New} />
    </ReleasesPageWrapper>
  );
};

export default NewReleasesPage;
