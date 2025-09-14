import { IEntry, IRelease, IReleaseSummary, IReleaseWithStats } from 'shared';
import { CardContainer } from '../../../components/containers/card-container';
import { Group } from '../../../components/flex/group';
import { Stack } from '../../../components/flex/stack';
import { ReleaseActions } from '../release-actions/release-actions';
import { Typography } from '../../../components/typography';
import { getYearFromDate } from '../../../utils/date-format';
import {
  getArtistPathname,
  getReleasePathname,
} from '../../../utils/get-pathname';
import { AllUsersRating } from '../../ratings/rating';
import { UserRating } from '../../ratings/rating';
import {
  ArtistsLinks,
  ReleaseImageLink,
  releaseImageWidthMap,
  ReleaseImageSizeT,
  ReleaseTitleLink,
  ReviewLink,
  FavoriteTracks,
} from './shared';
import { FlexChild } from '../../../components/flex/flex-child';

export interface IReleaseItemProps {
  release: IReleaseSummary | IRelease | IReleaseWithStats;
  entry?: IEntry;

  size?: ReleaseImageSizeT;
}
export const Release: React.FC<IReleaseItemProps> = ({
  release,
  entry,
  size = 'md',
}) => {
  const isUserEntry = !!entry;

  const isDetailedRelease = (
    release: IReleaseSummary | IRelease | IReleaseWithStats,
  ): release is IRelease => {
    return 'type' in release && 'date' in release;
  };

  const isReleaseWithStats = (
    release: IReleaseSummary | IRelease | IReleaseWithStats,
  ): release is IReleaseWithStats => {
    return 'stats' in release;
  };

  if (size === 'sm' || size === 'xs') {
    return (
      <Group gap="md">
        <div
          css={{
            width: '100px',
          }}
        >
          <ReleaseImageLink release={release} size="xs" />
        </div>
        <FlexChild grow>
          <Stack gap="sm">
            <ArtistsLinks
              links={release.artists.map((a) => ({
                href: getArtistPathname(a.id),
                label: a.name,
              }))}
            />
            <ReleaseTitleLink to={getReleasePathname(release.id)}>
              {release.title}
            </ReleaseTitleLink>
            {isDetailedRelease(release) && (
              <Typography size="small">
                {`${getYearFromDate(release.date)} · ${release.type}`}
              </Typography>
            )}
          </Stack>
        </FlexChild>
      </Group>
    );
  }

  return (
    <CardContainer
      css={{
        maxWidth: releaseImageWidthMap[size],
        width: '100%',
      }}
    >
      <Stack gap="sm">
        <ReleaseImageLink release={release} size={size} />
        <Stack gap="sm">
          <ArtistsLinks
            links={release.artists.map((a) => ({
              href: getArtistPathname(a.id),
              label: a.name,
            }))}
          />
          <ReleaseTitleLink to={getReleasePathname(release.id)}>
            {release.title}
          </ReleaseTitleLink>
          {isDetailedRelease(release) && (
            <>
              <Group justify="apart" align="center">
                {isUserEntry ? (
                  <Group gap="sm">
                    <UserRating rating={entry.rating} />
                    {!!entry.reviewId && <ReviewLink entryId={entry.id} />}
                    {entry.hasTrackVotes && (
                      <FavoriteTracks entryId={entry.id} />
                    )}
                  </Group>
                ) : isReleaseWithStats(release) &&
                  release.stats?.ratingsCount > 0 ? (
                  <AllUsersRating
                    rating={release.stats.ratingsAvg}
                    count={release.stats.ratingsCount}
                  />
                ) : (
                  <div></div>
                )}
                <ReleaseActions id={release.id} date={release.date} />
              </Group>
              <Typography size="small" color="sub">
                {`${getYearFromDate(release.date)} · ${release.type}`}
              </Typography>
            </>
          )}
        </Stack>
      </Stack>
    </CardContainer>
  );
};
