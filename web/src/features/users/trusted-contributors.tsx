import { useQuery } from '@tanstack/react-query';
import { FindUsersType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { User } from './user';
export const TrustedContributors: React.FC = () => {
  const { data, isLoading } = useQuery(
    cacheKeys.findUsersKey(FindUsersType.Trusted),
    () => api.findUsers(FindUsersType.Trusted),
  );

  if (isLoading) return <Loading />;

  const contributors = data?.users || [];

  return (
    <Stack gap="md">
      <Typography size="title">Trusted Contributors</Typography>
      <Typography>
        Shoutout to our trusted contributors for reviewing and approving
        contributions!
      </Typography>
      <Stack gap="md">
        {contributors.map((contributor) => (
          <User key={contributor.id} user={contributor} />
        ))}
      </Stack>
    </Stack>
  );
};
