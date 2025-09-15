import { FindReleasesType } from 'shared';
import ReleasesListRenderer from './releases-list-renderer';
import ReleasesPageWrapper from './releases-page-wrapper';

const NewReleasesPage = () => {
  return (
    <ReleasesPageWrapper>
      <ReleasesListRenderer type={FindReleasesType.NewPopular} />
    </ReleasesPageWrapper>
  );
};

export default NewReleasesPage;
