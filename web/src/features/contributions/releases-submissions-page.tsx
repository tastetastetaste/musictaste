import { ReleaseSubmissionsList } from './release-submission-list';
import AppPageWrapper from '../../layout/app-page-wrapper';

const ReleasesSubmissions = () => {
  return (
    <AppPageWrapper>
      <ReleaseSubmissionsList open />
    </AppPageWrapper>
  );
};

export default ReleasesSubmissions;
