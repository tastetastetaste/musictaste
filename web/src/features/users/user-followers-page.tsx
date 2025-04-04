import { useOutletContext } from 'react-router-dom';
import UserConnectionsList from './users-connections-list';
import { UserPageOutletContext } from './user-page-wrapper';

const UserFollowersPage = () => {
  const { user } = useOutletContext<UserPageOutletContext>();

  return <UserConnectionsList connectionType="followers" userId={user.id} />;
};

export default UserFollowersPage;
