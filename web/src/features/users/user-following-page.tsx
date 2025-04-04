import { useOutletContext } from 'react-router-dom';
import UserConnectionsList from './users-connections-list';
import { UserPageOutletContext } from './user-page-wrapper';

const UserFollowingPage = () => {
  const { user } = useOutletContext<UserPageOutletContext>();

  return <UserConnectionsList connectionType="following" userId={user.id} />;
};

export default UserFollowingPage;
