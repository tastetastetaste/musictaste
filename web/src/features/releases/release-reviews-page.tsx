import { useOutletContext } from 'react-router-dom';
import ReviewsListRenderer from '../reviews/reviews-list-renderer';
import { ReleasePageOutletContext } from './release-page-wrapper';
import { ReviewsSortByEnum } from 'shared';

const ReleaseReviewsPage = () => {
  const { releaseId } = useOutletContext<ReleasePageOutletContext>();
  return (
    <ReviewsListRenderer
      releaseId={releaseId}
      sortBy={ReviewsSortByEnum.ReviewDate}
    />
  );
};

export default ReleaseReviewsPage;
