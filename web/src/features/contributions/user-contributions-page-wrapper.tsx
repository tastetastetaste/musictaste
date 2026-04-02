import { useQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { SubmissionSortByEnum, SubmissionType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Navigation } from '../../components/nav';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const UserContributionsPageWrapper = () => {
  const { username } = useParams();
  const location = useLocation();

  const [submissionType, setSubmissionType] = useState(SubmissionType.CREATE);

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

  useEffect(() => {
    if (location.pathname.endsWith('edit')) {
      setSubmissionType(SubmissionType.UPDATE);
    } else {
      setSubmissionType(SubmissionType.CREATE);
    }
  }, [location]);

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <AppPageWrapper>
      <Stack gap={10}>
        <Typography>{`@${username}'s contributions`}</Typography>
        <Stack align="start">
          <Navigation
            links={[
              {
                label: 'Added releases',
                count: stats?.addedReleases,
                to: `/${username}/contributions/release-add`,
              },
              {
                label: 'Edited releases',
                count: stats?.editedReleases,
                to: `/${username}/contributions/release-edit`,
              },
              {
                label: 'Added artists',
                count: stats?.addedArtists,
                to: `/${username}/contributions/artist-add`,
              },
              {
                label: 'Edited artists',
                count: stats?.editedArtists,
                to: `/${username}/contributions/artist-edit`,
              },
              {
                label: 'Added labels',
                count: stats?.addedLabels,
                to: `/${username}/contributions/label-add`,
              },
              {
                label: 'Edited labels',
                count: stats?.editedLabels,
                to: `/${username}/contributions/label-edit`,
              },
              {
                label: 'Added genres',
                count: stats?.addedGenres,
                to: `/${username}/contributions/genre-add`,
              },
              {
                label: 'Edited genres',
                count: stats?.editedGenres,
                to: `/${username}/contributions/genre-edit`,
              },
              {
                label: 'Genre votes',
                count: stats?.genreVotes,
                to: `/${username}/contributions/genre-vote`,
              },
              {
                label: 'Submission votes',
                count:
                  stats?.releaseSubmissionVotes +
                  stats?.artistSubmissionVotes +
                  stats?.labelSubmissionVotes +
                  stats?.genreSubmissionVotes,
                to: `/${username}/contributions/release-submission-vote`,
              },
            ]}
          />
          {location.pathname.endsWith('submission-vote') && (
            <Navigation
              links={[
                {
                  label: 'Releases',
                  count: stats?.releaseSubmissionVotes,
                  to: `/${username}/contributions/release-submission-vote`,
                },
                {
                  label: 'Artists',
                  count: stats?.artistSubmissionVotes,
                  to: `/${username}/contributions/artist-submission-vote`,
                },
                {
                  label: 'Labels',
                  count: stats?.labelSubmissionVotes,
                  to: `/${username}/contributions/label-submission-vote`,
                },
                {
                  label: 'Genres',
                  count: stats?.genreSubmissionVotes,
                  to: `/${username}/contributions/genre-submission-vote`,
                },
              ]}
            />
          )}
        </Stack>
        <Outlet
          context={
            location.pathname.endsWith('submission-vote')
              ? {
                  voteByUserId: data.user.id,
                  sortBy: SubmissionSortByEnum.Newest,
                }
              : {
                  userId: data.user.id,
                  sortBy: SubmissionSortByEnum.Newest,
                  type: submissionType,
                }
          }
        />
      </Stack>
    </AppPageWrapper>
  );
};

export default UserContributionsPageWrapper;
