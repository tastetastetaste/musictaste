import { useTheme } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import {
  CommentEntityType,
  ExplicitCoverArt,
  getGenrePath,
  IReleaseCover,
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
import { formatExactDate, getYearFromDate } from '../../utils/date-format';
import { useAuth } from '../account/useAuth';
import { Comments } from '../comments/comments';
import { RatingCircle } from '../ratings/rating';
import { ReportDialog } from '../reports/report-dialog';
import { User } from '../users/user';
import { formatReleaseType } from './format-release-type';
import { ReleaseActionsFullPage } from './release-actions/release-actions-full-page';
import ReleaseGenreVote from './release-genre-vote';
import ReleaseTracks from './release-tracks';
import {
  ArtistsLinks,
  GenresLinks,
  hideExplicitCoverArtFn,
  LabelsLinks,
} from './release/shared';
import { FollowingUserEntry } from './user-entry';

const ReleaseInfo: React.FC<{
  release: any;
  isLoggedIn?: boolean;
}> = ({
  release: { id: releaseId, date: date, genres, labels, languages, type },
  isLoggedIn,
}) => {
  const dateStr = formatExactDate(date);

  const languagesStr =
    languages && languages.map((lang: any) => lang.name).join(', ');

  // const labelStr = labels && labels.map((label: any) => label.name).join(', ');

  // const genresStr =
  //   (genres &&
  //     genres.length !== 0 &&
  //     genres.map((genre: any) => genre.name).join(', ')) ||
  //   '';

  return (
    <Stack gap="lg">
      <Group gap={5}>
        <Typography
          color="sub"
          css={{
            width: '90px',
          }}
        >
          Date
        </Typography>
        <Typography>{dateStr}</Typography>
      </Group>

      <Group gap={5}>
        <Typography
          color="sub"
          css={{
            width: '90px',
          }}
        >
          Type
        </Typography>
        <Typography>{formatReleaseType(type)}</Typography>
      </Group>
      {languagesStr && (
        <Group gap={5}>
          <Typography
            color="sub"
            css={{
              width: '90px',
            }}
          >
            Language
          </Typography>
          <Typography>{languagesStr}</Typography>
        </Group>
      )}
      {labels.length ? (
        <Group gap={5}>
          <Typography
            color="sub"
            css={{
              width: '90px',
            }}
          >
            Label
          </Typography>
          {/* <Typography>{labelStr}</Typography> */}

          <LabelsLinks labels={labels} />
        </Group>
      ) : null}
      <Group gap={5}>
        <Typography
          color="sub"
          css={{
            width: '90px',
          }}
        >
          Genre
        </Typography>
        {/* <Typography>{genresStr}</Typography> */}

        <GenresLinks
          links={genres.map((a) => ({
            label: a.name,
            href: getGenrePath({ genreId: a.id }),
          }))}
        />
        {isLoggedIn && <ReleaseGenreVote releaseId={releaseId} />}
      </Group>
    </Stack>
  );
};

const ReleaseCover: React.FC<{
  explicitCoverArt?: ExplicitCoverArt[];
  src?: IReleaseCover;
  alt: string;
}> = ({ src, alt, explicitCoverArt }) => {
  const { border_radius, colors } = useTheme();
  const size = 600;

  const hideExplicitCoverArt = hideExplicitCoverArtFn(explicitCoverArt);

  return (
    <img
      id="cover"
      src={
        hideExplicitCoverArt
          ? `/placeholder/explicit-lg.jpeg`
          : src
            ? src.lg
            : '/placeholder/lg.jpeg'
      }
      width={size}
      height={size}
      css={{
        maxWidth: '100%',
        borderRadius: border_radius.base,
        height: 'auto',
        boxShadow: `${colors.background} 0px 2px 3px`,
      }}
      alt={alt}
    />
  );
};

const FollowingSection: React.FC<{
  releaseId: string;
}> = ({ releaseId }) => {
  const { data, isLoading } = useQuery(
    cacheKeys.releaseFollowingEntriesKey(releaseId),
    () => api.getFollowingEntries(releaseId),
  );

  if (!data || data.length === 0) {
    return <div></div>;
  }

  return (
    <div
      css={{
        width: '360px',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack gap="sm">
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
        width: '360px',
        maxWidth: '100%',
        overflow: 'hidden',
        paddingBottom: '24px',
      }}
    >
      <Stack gap="sm">
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
  const { id, title, titleLatin, cover, artists, date } = release;

  const { colors } = useTheme();

  const { isLoggedIn } = useAuth();

  const smScreen = useMediaQuery({ down: 'md' });
  const mdScreen = useMediaQuery({ down: 'lg' });

  const [openReport, setOpenReport] = useState(false);

  return (
    <AppPageWrapper
      title={`${release.title} By ${release.artists
        .map((a) => a.name)
        .join(' & ')}`}
      menu={[
        {
          label: 'Edit',
          to: '/contributions/releases/' + release.id,
        },
        {
          label: 'History',
          to: '/history/release/' + release.id,
        },
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
      <ResponsiveRow breakpoint="md" gap="lg">
        <FlexChild grow shrink basis="0">
          <Group justify="center">
            <ReleaseCover
              explicitCoverArt={release.explicitCoverArt}
              src={release.cover}
              alt={`${release.artists.map((a) => a.name).join(', ')} - ${release.title}`}
            />
          </Group>
        </FlexChild>
        <FlexChild
          grow
          shrink
          basis="0"
          style={{
            paddingTop: smScreen ? '24px' : '40px',
          }}
        >
          <Stack gap="lg">
            <Group align="center" justify="apart" gap="lg">
              <Stack>
                <ArtistsLinks artists={artists} />
                <Typography size="title-xl">{title}</Typography>
                {titleLatin && (
                  <Typography size="title-lg">{titleLatin}</Typography>
                )}
              </Stack>
              {release.stats?.ratingsCount > 0 && (
                <RatingCircle
                  rating={release.stats.ratingsAvg}
                  count={release.stats.ratingsCount}
                  lg
                />
              )}
            </Group>
            <ReleaseInfo release={release} isLoggedIn={isLoggedIn} />
            <div
              style={{
                paddingTop: '12px',
                paddingBottom: '12px',
              }}
            >
              {isLoggedIn && <ReleaseActionsFullPage id={id} date={date} />}
            </div>
          </Stack>
        </FlexChild>
      </ResponsiveRow>
      <ResponsiveRow breakpoint="md" gap="lg" reversed>
        <FlexChild grow>{children}</FlexChild>
        <FlexChild basis="400px">
          <div
            css={{
              position: 'relative',
              top: mdScreen ? '10px' : '-150px',
            }}
          >
            <Stack align={smScreen ? 'center' : 'end'} gap="lg">
              {tracks && (
                <ReleaseTracks
                  releaseId={id}
                  releaseTracks={tracks}
                  date={date}
                />
              )}
              <FollowingSection releaseId={id} />
              <div
                css={{
                  width: '360px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <Stack gap="sm">
                  <Typography size="title">Comments</Typography>
                  <Comments
                    entityType={CommentEntityType.RELEASE}
                    entityId={id}
                  />
                </Stack>
              </div>
              <ReleaseContributors contributors={contributors} />
            </Stack>
          </div>
        </FlexChild>
      </ResponsiveRow>
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
    </ReleasePageContainer>
  );
};

export default ReleasePageWrapper;
