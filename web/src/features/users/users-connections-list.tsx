import { api } from '../../utils/api';
import { useQuery } from 'react-query';
import { Group } from '../../components/flex/group';
import { Loading } from '../../components/loading';
import { User } from './user';
import { cacheKeys } from '../../utils/cache-keys';

export interface UserConnectionsListProps {
  connectionType: 'following' | 'followers';
  userId: string;
}
export function UserConnectionsList({
  connectionType,
  userId,
}: UserConnectionsListProps) {
  const { data, isLoading } = useQuery(
    connectionType === 'followers'
      ? cacheKeys.userFollowersKey(userId)
      : cacheKeys.userFollowingKey(userId),
    async ({ pageParam = 1 }) =>
      connectionType === 'followers'
        ? api.getUserFollowers(userId)
        : api.getUserFollowing(userId),
  );

  return (
    <Group wrap gap={10}>
      {isLoading && <Loading />}
      {data && data.users.map((u) => <User isLarge key={u.id} user={u} />)}
    </Group>
  );
}

export default UserConnectionsList;
