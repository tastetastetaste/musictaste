import { Feedback } from '../components/feedback';
import AppPageWrapper from './app-page-wrapper';

export const NotFound = () => {
  return <Feedback message="404: Not found" />;
};

const NotFoundPage = () => {
  return (
    <AppPageWrapper>
      <NotFound />
    </AppPageWrapper>
  );
};

export default NotFoundPage;
