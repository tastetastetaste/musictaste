import { EntriesSortByEnum } from 'shared';
import ReviewsListRenderer from './reviews-list-renderer';
import ReviewsPageWrapper from './reviews-page-wrapper';

const NewReviewsPage = () => {
  return (
    <ReviewsPageWrapper>
      <ReviewsListRenderer sortBy={EntriesSortByEnum.ReviewDate} />
    </ReviewsPageWrapper>
  );
};

export default NewReviewsPage;
