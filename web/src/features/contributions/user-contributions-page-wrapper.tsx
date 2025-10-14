import { useQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { SubmissionSortByEnum } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Navigation } from '../../components/nav';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

const UserContributionsPageWrapper = () => {
  const { username } = useParams();

  const { data, isLoading } = useQuery(
    cacheKeys.userProfileKey(username),
    () => api.getUserProfile(username!),
    {
      enabled: !!username,
    },
  );

  const { data: stats, isLoading: isLoadingStats } = useQuery(
    cacheKeys.userContributionsStatsKey(data?.user.id),
    () => api.getUserContributionsStats(data?.user.id),
    {
      enabled: !!data?.user.id,
    },
  );

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <AppPageWrapper>
      <Stack gap={10}>
        <Typography>{`@${username}'s contributions`}</Typography>
        <Typography>{`Added: ${stats?.addedReleases || '-'} releases, ${stats?.addedArtists || '-'} artists, ${stats?.addedLabels || '-'} labels`}</Typography>
        <Typography>{`Edited: ${stats?.editedReleases || '-'} releases, ${stats?.editedArtists || '-'} artists, ${stats?.editedLabels || '-'} labels`}</Typography>
        <Navigation
          links={[
            {
              label: 'releases',
              to: `/${username}/contributions/releases`,
            },
            {
              label: 'artists',
              to: `/${username}/contributions/artists`,
            },
            {
              label: 'labels',
              to: `/${username}/contributions/labels`,
            },
            {
              label: 'genres',
              to: `/${username}/contributions/genres`,
            },
          ]}
        />
        <Outlet
          context={{
            userId: data.user.id,
            sortBy: SubmissionSortByEnum.Newest,
          }}
        />
      </Stack>
    </AppPageWrapper>
  );
};

export default UserContributionsPageWrapper;
