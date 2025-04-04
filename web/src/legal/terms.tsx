import { Markdown } from '../components/markdown';
import AppPageWrapper from '../layout/app-page-wrapper';
import { TERMS_MD } from '../static/terms';

const TermsAndConditionsPage = () => {
  return (
    <AppPageWrapper title="Terms and Conditions">
      <Markdown>{TERMS_MD}</Markdown>
    </AppPageWrapper>
  );
};
export default TermsAndConditionsPage;
