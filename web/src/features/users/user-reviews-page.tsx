import { useOutletContext } from 'react-router-dom';
import { ReviewsSortByEnum } from 'shared';
import ReviewsListRenderer from '../reviews/reviews-list-renderer';
import { UserPageOutletContext } from './user-page-wrapper';

const UserReviewsPage = () => {
  const { user, isUserMyself } = useOutletContext<UserPageOutletContext>();

  return (
    <ReviewsListRenderer
      userId={user.id}
      sortBy={ReviewsSortByEnum.ReviewDate}
      user={user}
    />
  );
};

export default UserReviewsPage;
