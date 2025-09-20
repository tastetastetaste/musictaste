import { useOutletContext } from 'react-router-dom';
import ReviewsListRenderer from '../reviews/reviews-list-renderer';
import { UserPageOutletContext } from './user-page-wrapper';
import { EntriesSortByEnum } from 'shared';

const UserReviewsPage = () => {
  const { user, isUserMyself } = useOutletContext<UserPageOutletContext>();

  return (
    <ReviewsListRenderer
      userId={user.id}
      sortBy={EntriesSortByEnum.ReviewDate}
      user={user}
    />
  );
};

export default UserReviewsPage;
