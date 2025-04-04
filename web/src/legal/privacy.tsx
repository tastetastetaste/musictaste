import { Markdown } from '../components/markdown';
import AppPageWrapper from '../layout/app-page-wrapper';
import { PRIVACY_MD } from '../static/privacy';

const PrivacyPolicyPage = () => {
  return (
    <AppPageWrapper title="Privacy Policy">
      <Markdown>{PRIVACY_MD}</Markdown>
    </AppPageWrapper>
  );
};
export default PrivacyPolicyPage;
