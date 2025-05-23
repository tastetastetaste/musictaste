import { Feedback } from '../components/feedback';
import AppPageWrapper from './app-page-wrapper';

const NotFoundPage = () => {
  return (
    <AppPageWrapper>
      <Feedback message="404: Not found" />
    </AppPageWrapper>
  );
};

export default NotFoundPage;
