import { IEntry, IRelease, IReleaseSummary, IReleaseWithStats } from 'shared';
import { CardContainer } from '../../../components/containers/card-container';
import { FlexChild } from '../../../components/flex/flex-child';
import { Group } from '../../../components/flex/group';
import { Stack } from '../../../components/flex/stack';
import { Typography } from '../../../components/typography';
import { getYearFromDate } from '../../../utils/date-format';
import { getReleasePath } from 'shared';
import { AllUsersRating } from '../../ratings/rating';
import { formatReleaseType } from '../format-release-type';
import { ReleaseActions } from '../release-actions/release-actions';
import { UserEntryOnRelease } from '../user-entry';
import {
  ArtistsLinks,
  ReleaseImageLink,
  releaseImageWidthMap,
  ReleaseTitleLink,
} from './shared';

export interface IReleaseProps {
  release: IRelease | IReleaseWithStats;
  entry?: IEntry;
}

export interface IReleaseSmallProps {
  release: IRelease;
}
export const Release: React.FC<IReleaseProps> = ({ release, entry }) => {
  const isUserEntry = !!entry;

  const isReleaseWithStats = (
    release: IReleaseSummary | IRelease | IReleaseWithStats,
  ): release is IReleaseWithStats => {
    return 'stats' in release;
  };

  return (
    <CardContainer
      css={{
        maxWidth: releaseImageWidthMap['md'],
        width: '100%',
      }}
    >
      <Stack gap="sm">
        <ReleaseImageLink release={release} size={'md'} />
        <Stack gap="sm">
          <ArtistsLinks artists={release.artists} />
          <ReleaseTitleLink
            to={getReleasePath({ releaseId: release.id })}
            title={release.title}
            latinTitle={release.titleLatin}
          />
          <>
            <Group justify="apart" align="center">
              <Stack gap="sm" align="start">
                {isUserEntry ? (
                  <UserEntryOnRelease entry={entry} />
                ) : isReleaseWithStats(release) &&
                  release.stats?.ratingsCount > 0 ? (
                  <AllUsersRating
                    rating={release.stats.ratingsAvg}
                    count={release.stats.ratingsCount}
                  />
                ) : (
                  <div></div>
                )}
                <Typography size="small" color="sub">
                  {`${getYearFromDate(release.date)} · ${formatReleaseType(release.type)}`}
                </Typography>
              </Stack>
              <ReleaseActions id={release.id} date={release.date} />
            </Group>
          </>
        </Stack>
      </Stack>
    </CardContainer>
  );
};

export const ReleaseSmall: React.FC<IReleaseProps> = ({ release }) => {
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
          <ArtistsLinks artists={release.artists} />
          <ReleaseTitleLink
            to={getReleasePath({ releaseId: release.id })}
            title={release.title}
            latinTitle={release.titleLatin}
          />
          <Typography size="small">
            {`${getYearFromDate(release.date)} · ${formatReleaseType(release.type)}`}
          </Typography>
        </Stack>
      </FlexChild>
    </Group>
  );
};
