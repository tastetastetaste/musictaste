import { EntriesSortByEnum } from 'shared';
import ReviewsListRenderer from './reviews-list-renderer';
import ReviewsPageWrapper from './reviews-page-wrapper';

const TopReviewsPage = () => {
  return (
    <ReviewsPageWrapper>
      <ReviewsListRenderer sortBy={EntriesSortByEnum.ReviewTop} />
    </ReviewsPageWrapper>
  );
};

export default TopReviewsPage;
