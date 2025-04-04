import { api } from '../../utils/api';
import { useQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { User } from '../users/user';
import { SearchPageOutletContext } from './search-page-wrapper';
import { cacheKeys } from '../../utils/cache-keys';

const SearchUser = ({ q }: { q: string }) => {
  const { data, isLoading, refetch } = useQuery(
    cacheKeys.searchKey({
      q: q!,
      type: ['users'],
      page: 1,
      pageSize: 12,
    }),
    () =>
      api.search({
        q: q!,
        type: ['users'],
        page: 1,
        pageSize: 12,
      }),
    { enabled: !!q },
  );
  const users = data?.users;

  if (!q) return null;

  if (isLoading) return <span>loading</span>;

  if (users && users.length === 0) return null;

  return (
    <Stack gap={10}>
      {users && users.map((user) => <User key={user.id} user={user} />)}
    </Stack>
  );
};

const SearchUserPage = () => {
  const { q } = useOutletContext<SearchPageOutletContext>();

  return <SearchUser q={q} />;
};

export default SearchUserPage;
