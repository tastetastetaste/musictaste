import { IconHistory, IconPencil } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import {
  CommentEntityType,
  IReleaseResponse,
  IUserSummary,
  ReportType,
} from 'shared';
import { Feedback } from '../../components/feedback';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Navigation } from '../../components/nav';
import { Typography } from '../../components/typography';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { getYearFromDate } from '../../utils/date-format';
import { Comments } from '../comments/comments';
import { ReportDialog } from '../reports/report-dialog';
import { User } from '../users/user';
import { ReleaseOverview } from './release-overview';
import ReleaseTracks from './release-tracks';
import { FollowingUserEntry } from './user-entry';
import { SIDECONTENT_WIDTH } from '../../static/spacing';

const FollowingSection: React.FC<{
  releaseId: string;
}> = ({ releaseId }) => {
  const { data, isLoading } = useQuery(
    cacheKeys.releaseFollowingEntriesKey(releaseId),
    () => api.getFollowingEntries(releaseId),
  );

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div
      css={{
        width: SIDECONTENT_WIDTH,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack gap="md">
        <Typography size="title">From Following</Typography>
        <Group wrap gap={10}>
          {data?.map((r) => <FollowingUserEntry entry={r} />)}
        </Group>
      </Stack>
    </div>
  );
};

const ReleaseContributors = ({
  contributors,
}: {
  contributors: IUserSummary[];
}) => {
  return (
    <div
      css={{
        width: SIDECONTENT_WIDTH,
        maxWidth: '100%',
        overflow: 'hidden',
        paddingBottom: '12px',
      }}
    >
      <Stack gap="md">
        <Typography size="title">Contributors</Typography>
        <Group gap="sm">
          {contributors.map((u, i) => (
            <User key={u.id} user={u} avatarOnly />
          ))}
        </Group>
      </Stack>
    </div>
  );
};

export const ReleasePageContainer: React.FC<{
  data: IReleaseResponse;
  children: JSX.Element | JSX.Element[];
}> = ({ data: { release, tracks, contributors }, children }) => {
  const mdScreen = useMediaQuery({ down: 'md' });
  const smScreen = useMediaQuery({ down: 'sm' });

  const [openReport, setOpenReport] = useState(false);

  return (
    <AppPageWrapper
      title={`${release.title} By ${release.artists
        .map((a) => a.name)
        .join(' & ')}`}
      quickActions={[
        {
          label: 'Edit',
          to: '/contributions/releases/' + release.id,
          icon: IconPencil,
        },
        {
          label: 'History',
          to: '/history/release/' + release.id,
          icon: IconHistory,
        },
      ]}
      canCopyLink
      canCopyReference
      menu={[
        {
          label: 'Report',
          action: () => setOpenReport(true),
        },
      ]}
      image={release?.cover?.original}
      description={`${release.title} By ${release.artists
        .map((a) => a.name)
        .join(' & ')} released in ${getYearFromDate(release.date)}. ${
        (release.genres &&
          release.genres.length !== 0 &&
          `Genres: ${release.genres.map((genre) => genre.name).join(', ')}.`) ||
        ''
      } Music Reviews, Music Ratings, Music Lists.`}
    >
      <Stack gap="xl">
        <ReleaseOverview release={release} />
        <ResponsiveRow breakpoint="md" gap="xl" reversed>
          <FlexChild grow>{children}</FlexChild>
          <FlexChild basis={SIDECONTENT_WIDTH}>
            <Stack align={mdScreen ? 'center' : undefined} gap="xl">
              {tracks && (
                <ReleaseTracks
                  releaseId={release.id}
                  releaseTracks={tracks}
                  date={release.date}
                />
              )}
              <FollowingSection releaseId={release.id} />
              <div
                css={{
                  width: SIDECONTENT_WIDTH,
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <Stack gap="md">
                  <Typography size="title">Comments</Typography>
                  <Comments
                    entityType={CommentEntityType.RELEASE}
                    entityId={release.id}
                  />
                </Stack>
              </div>
              <ReleaseContributors contributors={contributors} />
            </Stack>
          </FlexChild>
        </ResponsiveRow>
      </Stack>
      <ReportDialog
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        id={release.id}
        type={ReportType.RELEASE}
      />
    </AppPageWrapper>
  );
};

export type ReleasePageOutletContext = {
  releaseId: string;
};

const ReleasePageWrapper: React.FC = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(
    cacheKeys.releaseKey(id),
    () => api.getRelease(id!),
    {
      enabled: !!id,
    },
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && !data) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }

  return (
    <ReleasePageContainer data={data}>
      <Stack gap="lg">
        <Navigation
          links={[
            {
              to: `/release/${id}`,
              label: 'Reviews',
            },
            {
              to: `/release/${id}/lists`,
              label: 'Lists',
            },
            {
              to: `/release/${id}/ratings`,
              label: 'Ratings',
            },
          ]}
        />
        <Outlet context={{ releaseId: data.release.id }} />
      </Stack>
    </ReleasePageContainer>
  );
};

export default ReleasePageWrapper;
