import { useQuery } from '@tanstack/react-query';
import { FindUsersType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { User } from './user';
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
