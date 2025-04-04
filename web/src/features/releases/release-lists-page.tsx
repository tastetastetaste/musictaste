import { useOutletContext } from 'react-router-dom';
import Lists from '../lists/lists-list-renderer';
import { ReleasePageOutletContext } from './release-page-wrapper';

const ReleaseListsPage = () => {
  const { releaseId } = useOutletContext<ReleasePageOutletContext>();

  return <Lists releaseId={releaseId} />;
};

export default ReleaseListsPage;
