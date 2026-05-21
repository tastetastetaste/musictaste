import { ReviewsSortByEnum } from 'shared';
import ReviewsListRenderer from './reviews-list-renderer';
import ReviewsPageWrapper from './reviews-page-wrapper';

const TopReviewsPage = () => {
  return (
    <ReviewsPageWrapper>
      <ReviewsListRenderer sortBy={ReviewsSortByEnum.ReviewTop} />
    </ReviewsPageWrapper>
  );
};

export default TopReviewsPage;
