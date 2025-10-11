import { useQuery } from 'react-query';
import { api } from '../../utils/api';
import { User } from './user';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { FindUsersType } from 'shared';
import { cacheKeys } from '../../utils/cache-keys';
import { Group } from '../../components/flex/group';
import { Loading } from '../../components/loading';
export const Supporters: React.FC = () => {
  const { data, isLoading } = useQuery(
    cacheKeys.findUsersKey(FindUsersType.Supporter),
    () => api.findUsers(FindUsersType.Supporter),
  );

  if (isLoading) return <Loading />;

  const contributors = data?.users || [];

  return (
    <Stack gap="md">
      <Typography size="title">Supporters</Typography>
      <Typography>
        Huge thanks to these wonderful people for believing in this project and
        supporting what we do!
      </Typography>
      <Stack gap="md">
        {contributors.map((contributor) => (
          <User key={contributor.id} user={contributor} />
        ))}
      </Stack>
    </Stack>
  );
};
